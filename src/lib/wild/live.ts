import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseScoutPayload } from "./parse-scout.ts";
import { composeLocal, type RestateInput } from "./restate.ts";
import {
  GEARS,
  SECTION_HEADINGS,
  type Gear,
  type Restatement,
} from "./types.ts";

const MODELS = ["grok-4.7", "grok-4.5"] as const;

const operatorSchema = z.object({
  name: z.string().max(80),
  tools: z.array(z.string().max(80)).max(40),
  hardware: z.array(z.string().max(80)).max(40),
  subscriptions: z.array(z.string().max(80)).max(40),
  constraints: z.array(z.string().max(80)).max(40),
});

const scoutInput = z.object({
  gear: z.enum(GEARS),
  target: z.string().trim().min(3).max(400),
  operator: operatorSchema,
});

const imagineInput = z.object({
  scope: z.string().max(180),
  items: z
    .array(
      z.object({
        title: z.string().max(160),
        horizon: z.string().max(40),
        kind: z.string().max(40),
        claim: z.string().max(600),
        execute: z.string().max(500),
        gaps: z.array(z.string().max(160)).max(8),
        fail: z.string().max(800).nullable(),
        restrictions: z.string().max(400),
        bleeding: z.boolean(),
      }),
    )
    .max(24),
});

type LiveResult =
  | { ok: true; text: string; citations: string[] }
  | { ok: false; error: string; code?: string };

const SCOUT_INSTRUCTIONS = `You are the scout and cataloger for the skill "What in the Wild".

Search the live public web. Prefer primary sources: papers, specifications, official docs, source repositories, maintainer notes, and benchmarks. Use secondary writeups only to find those.

Boundaries:
- Lawful study only: published research, open source, documented APIs, public practice, and systems the operator can lawfully inspect.
- Do not provide exploits, intrusion steps, malware, credential theft, or ways to break access controls.
- Do not invent URLs, version numbers, papers, or benchmarks. If a source did not support a claim, omit the claim.
- Do not imagine a product or a pep talk. Do not merge distinct techniques into one summary. Filing is not reducing.

Stance:
- Search as if money and time were not the filter.
- Then tag every filing against the operator's real arsenal. Constraints are hard limits on the tag, not on what you are allowed to find.

Horizons, exactly one:
- "today" — replicable with the listed tools, hardware, and subscriptions, plus ordinary glue.
- "software" — same hardware and subscriptions; needs a reasonable software change.
- "modest" — needs a modest hardware buy or a subscription they do not have. Name it in gaps.
- "informational-fail" — do not execute, but only when the fail case names the missing condition, the opportunity it blocks, and what would be wasted. Vague "too hard" is forbidden; omit those.

Fail is null unless it meets that bar.

Return JSON only:
{"items":[{"title":"","kind":"concept|structure|technique|method|practice","locus":"","claim":"","reverse":"","bleeding":false,"horizon":"today|software|modest|informational-fail","uses":[],"gaps":[],"execute":"","fail":null,"restrictions":"","sources":[{"title":"","url":"https://"}]}]}`;

function gearOrders(gear: Gear): string {
  if (gear === "needle") {
    return "Gear needle: at most 5 items. Highest reverse-engineer value for this exact target. No adjacent topics.";
  }
  if (gear === "digest") {
    return "Gear digest: at most 10 items. The target and the structures it decomposes into. Stop before it becomes a survey.";
  }
  return "Gear field: at most 16 items. Broad stockpile of distinct techniques. Do not rank away a rare method that is still replicable. Do not synthesize.";
}

function readCitations(body: unknown): string[] {
  if (!body || typeof body !== "object") return [];
  const citations = (body as { citations?: unknown }).citations;
  if (!Array.isArray(citations)) return [];
  return citations.filter((entry): entry is string => typeof entry === "string");
}

function readText(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const output = (body as { output?: unknown }).output;
  if (!Array.isArray(output)) {
    const fallback = (body as { choices?: { message?: { content?: string } }[] })
      .choices?.[0]?.message?.content;
    return typeof fallback === "string" ? fallback : "";
  }
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (typeof content === "string") {
      chunks.push(content);
      continue;
    }
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (!block || typeof block !== "object") continue;
      const text = (block as { text?: unknown }).text;
      if (typeof text === "string") chunks.push(text);
    }
  }
  return chunks.join("\n");
}

async function callModel(
  instructions: string,
  input: string,
  options: { search: boolean; maxOutput: number },
): Promise<LiveResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Live research is not available in this environment.", code: "unavailable" };
  }

  let lastError = "Live research failed.";
  let lastCode: string | undefined;

  for (const model of MODELS) {
    let response: Response;
    try {
      response = await fetch("https://api.x.ai/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(options.search ? 110_000 : 45_000),
        body: JSON.stringify({
          model,
          instructions,
          input,
          max_output_tokens: options.maxOutput,
          ...(options.search ? { tools: [{ type: "web_search" }] } : {}),
        }),
      });
    } catch {
      return {
        ok: false,
        error: "Live research timed out before a catalog came back.",
        code: "timeout",
      };
    }

    const raw = await response.text();
    let body: unknown = null;
    try {
      body = JSON.parse(raw);
    } catch {
      body = null;
    }

    if (!response.ok) {
      const record =
        body && typeof body === "object"
          ? (body as { error?: unknown; code?: unknown })
          : {};
      const message =
        typeof record.error === "string"
          ? record.error
          : `Research service error ${response.status}.`;
      const code = typeof record.code === "string" ? record.code : undefined;
      lastError = message;
      lastCode = code;
      const modelMiss =
        response.status === 400 || response.status === 404
          ? /model/i.test(message)
          : false;
      if (modelMiss && model !== MODELS[MODELS.length - 1]) continue;
      if (code?.includes("spending-limit") || /credit/i.test(message)) {
        return {
          ok: false,
          code: "credits",
          error:
            "Live search did not run. The research account has no credits left, so nothing was invented in its place.",
        };
      }
      return { ok: false, error: message, code };
    }

    const text = readText(body).trim();
    if (!text) {
      return { ok: false, error: "The scout returned an empty response.", code: "empty" };
    }
    return { ok: true, text, citations: readCitations(body) };
  }

  return { ok: false, error: lastError, code: lastCode };
}

export const scoutWild = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = scoutInput.safeParse(input);
    if (!parsed.success) {
      throw new Error("Name a target in a few words. Keep the arsenal short.");
    }
    return parsed.data;
  })
  .handler(async ({ data }) => {
    const maxOutput = data.gear === "needle" ? 2800 : data.gear === "digest" ? 4200 : 6400;
    const arsenal = {
      tools: data.operator.tools,
      hardware: data.operator.hardware,
      subscriptions: data.operator.subscriptions,
      constraints: data.operator.constraints,
    };
    const result = await callModel(
      SCOUT_INSTRUCTIONS,
      `${gearOrders(data.gear)}\n\nTarget: ${data.target}\n\nArsenal:\n${JSON.stringify(arsenal)}`,
      { search: true, maxOutput },
    );
    if (!result.ok) return result;

    try {
      const parsed = parseScoutPayload(result.text, {
        gear: data.gear,
        target: data.target,
        operator: { ...data.operator, portrait: "" },
      });
      return {
        ok: true as const,
        items: parsed.items,
        droppedThin: parsed.droppedThin,
        citations: result.citations,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "The catalog could not be read.";
      return { ok: false as const, error: message, code: "parse" };
    }
  });

const IMAGINE_INSTRUCTIONS = `You restate a reduced research catalog. You do not search. You do not add techniques that are not in the catalog. You do not drop a fail case that is present. You do not give a pep talk.

Return JSON only:
{"sections":[{"heading":"Today","body":""},{"heading":"If the software moves","body":""},{"heading":"Modest hardware or subscription","body":""},{"heading":"Fail cases to keep open","body":""}]}

If a section has nothing, set body to "Nothing in the reduced catalog." Plain sentences.`;

export const imagineWild = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = imagineInput.safeParse(input);
    if (!parsed.success) throw new Error("There is no reduced catalog to restate.");
    return parsed.data;
  })
  .handler(async ({ data }): Promise<
    | { ok: true; restatement: Restatement }
    | { ok: false; error: string; code?: string }
  > => {
    const localItems: RestateInput[] = data.items.map((item) => ({
      title: item.title,
      horizon: item.horizon,
      execute: item.execute,
      gaps: item.gaps,
      fail: item.fail,
      restrictions: item.restrictions,
    }));
    const fallback = (note: string) =>
      composeLocal(localItems, data.scope, note);

    const result = await callModel(
      IMAGINE_INSTRUCTIONS,
      `Scope: ${data.scope}\n\nCatalog:\n${JSON.stringify(data.items)}`,
      { search: false, maxOutput: 1400 },
    );
    if (!result.ok) {
      const note =
        result.code === "credits"
          ? "Composed from the reduced catalog. Live restatement has no credits, so a model did not write this."
          : "Composed from the reduced catalog. The restatement model did not run.";
      return { ok: true, restatement: fallback(note) };
    }
    try {
      const start = result.text.indexOf("{");
      const end = result.text.lastIndexOf("}");
      const parsed = JSON.parse(result.text.slice(start, end + 1)) as {
        sections?: { heading?: string; body?: string }[];
      };
      const incoming = new Map(
        (parsed.sections ?? []).map((section) => [section.heading ?? "", section.body ?? ""]),
      );
      const sections = SECTION_HEADINGS.map((heading) => ({
        heading,
        body: (incoming.get(heading) ?? "").trim() || "Nothing in the reduced catalog.",
      }));
      return {
        ok: true,
        restatement: {
          source: "model",
          scope: data.scope,
          note: "Restated from the reduced catalog only.",
          sections,
        },
      };
    } catch {
      return {
        ok: true,
        restatement: composeLocal(
          localItems,
          data.scope,
          "Composed from the reduced catalog. The model reply could not be read.",
        ),
      };
    }
  });
