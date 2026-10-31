import { guardBench, isSubstantialFail, normalizeDraft } from "./bench.ts";
import {
  GEARS,
  HORIZONS,
  KINDS,
  type Gear,
  type Horizon,
  type Kind,
  type Operator,
  type WildItem,
} from "./types.ts";

export type ScoutDraft = Omit<WildItem, "id" | "runId" | "createdAt">;

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function asKind(value: unknown): Kind {
  return KINDS.includes(value as Kind) ? (value as Kind) : "technique";
}

function asHorizon(value: unknown): Horizon {
  return HORIZONS.includes(value as Horizon)
    ? (value as Horizon)
    : "software";
}

function asSources(value: unknown): { title: string; url: string }[] {
  if (!Array.isArray(value)) return [];
  const sources: { title: string; url: string }[] = [];
  for (const entry of value) {
    const record = asRecord(entry);
    if (!record) continue;
    sources.push({
      title: asString(record.title),
      url: asString(record.url),
    });
  }
  return sources;
}

export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1] ?? text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("The scout did not return a catalog.");
  }
  return JSON.parse(body.slice(start, end + 1));
}

export function parseScoutPayload(
  text: string,
  context: { gear: Gear; target: string; operator: Operator },
): { items: ScoutDraft[]; droppedThin: number } {
  const parsed = extractJson(text);
  const record = asRecord(parsed);
  const rawItems = Array.isArray(parsed)
    ? parsed
    : Array.isArray(record?.items)
      ? record.items
      : null;
  if (!rawItems) throw new Error("The scout did not return a catalog.");

  const cap = context.gear === "needle" ? 5 : context.gear === "digest" ? 10 : 16;
  let droppedThin = 0;
  const items: ScoutDraft[] = [];

  for (const raw of rawItems) {
    const row = asRecord(raw);
    if (!row) continue;
    const failText = asString(row.fail).trim();
    const draft = normalizeDraft({
      gear: GEARS.includes(context.gear) ? context.gear : "needle",
      target: context.target,
      title: asString(row.title),
      kind: asKind(row.kind),
      locus: asString(row.locus),
      claim: asString(row.claim),
      reverse: asString(row.reverse),
      bleeding: row.bleeding === true,
      horizon: asHorizon(row.horizon),
      uses: asStringList(row.uses),
      gaps: asStringList(row.gaps),
      execute: asString(row.execute),
      fail: failText.length > 0 ? failText : null,
      restrictions: asString(row.restrictions),
      sources: asSources(row.sources),
      filed: "scout",
    });
    if (draft.title.length < 3 || draft.claim.length < 20) continue;
    if (!isSubstantialFail(draft)) {
      droppedThin += 1;
      continue;
    }
    items.push(guardBench(draft, context.operator));
    if (items.length >= cap) break;
  }

  if (items.length === 0) {
    throw new Error(
      droppedThin > 0
        ? "The scout only returned thin fail notes. Nothing was filed."
        : "The scout returned nothing worth filing.",
    );
  }

  return { items, droppedThin };
}
