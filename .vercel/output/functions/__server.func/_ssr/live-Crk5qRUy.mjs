import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { d as composeLocal, f as guardBench, h as normalizeDraft, i as HORIZONS, m as isSubstantialFail, n as GEARS, o as KINDS, s as SECTION_HEADINGS } from "./restate-_46zNhD3.mjs";
import { n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-Crk5qRUy.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asRecord(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return null;
	return value;
}
function asString(value) {
	return typeof value === "string" ? value : "";
}
function asStringList(value) {
	if (!Array.isArray(value)) return [];
	return value.filter((entry) => typeof entry === "string");
}
function asKind(value) {
	return KINDS.includes(value) ? value : "technique";
}
function asHorizon(value) {
	return HORIZONS.includes(value) ? value : "software";
}
function asSources(value) {
	if (!Array.isArray(value)) return [];
	const sources = [];
	for (const entry of value) {
		const record = asRecord(entry);
		if (!record) continue;
		sources.push({
			title: asString(record.title),
			url: asString(record.url)
		});
	}
	return sources;
}
function extractJson(text) {
	const body = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text;
	const start = body.indexOf("{");
	const end = body.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("The scout did not return a catalog.");
	return JSON.parse(body.slice(start, end + 1));
}
function parseScoutPayload(text, context) {
	const parsed = extractJson(text);
	const record = asRecord(parsed);
	const rawItems = Array.isArray(parsed) ? parsed : Array.isArray(record?.items) ? record.items : null;
	if (!rawItems) throw new Error("The scout did not return a catalog.");
	const cap = context.gear === "needle" ? 5 : context.gear === "digest" ? 10 : 16;
	let droppedThin = 0;
	const items = [];
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
			filed: "scout"
		});
		if (draft.title.length < 3 || draft.claim.length < 20) continue;
		if (!isSubstantialFail(draft)) {
			droppedThin += 1;
			continue;
		}
		items.push(guardBench(draft, context.operator));
		if (items.length >= cap) break;
	}
	if (items.length === 0) throw new Error(droppedThin > 0 ? "The scout only returned thin fail notes. Nothing was filed." : "The scout returned nothing worth filing.");
	return {
		items,
		droppedThin
	};
}
var MODELS = ["grok-4.7", "grok-4.5"];
var operatorSchema = object({
	name: string().max(80),
	tools: array(string().max(80)).max(40),
	hardware: array(string().max(80)).max(40),
	subscriptions: array(string().max(80)).max(40),
	constraints: array(string().max(80)).max(40)
});
var scoutInput = object({
	gear: _enum(GEARS),
	target: string().trim().min(3).max(400),
	operator: operatorSchema
});
var imagineInput = object({
	scope: string().max(180),
	items: array(object({
		title: string().max(160),
		horizon: string().max(40),
		kind: string().max(40),
		claim: string().max(600),
		execute: string().max(500),
		gaps: array(string().max(160)).max(8),
		fail: string().max(800).nullable(),
		restrictions: string().max(400),
		bleeding: boolean()
	})).max(24)
});
var SCOUT_INSTRUCTIONS = `You are the scout and cataloger for the skill "What in the Wild".

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
function gearOrders(gear) {
	if (gear === "needle") return "Gear needle: at most 5 items. Highest reverse-engineer value for this exact target. No adjacent topics.";
	if (gear === "digest") return "Gear digest: at most 10 items. The target and the structures it decomposes into. Stop before it becomes a survey.";
	return "Gear field: at most 16 items. Broad stockpile of distinct techniques. Do not rank away a rare method that is still replicable. Do not synthesize.";
}
function readCitations(body) {
	if (!body || typeof body !== "object") return [];
	const citations = body.citations;
	if (!Array.isArray(citations)) return [];
	return citations.filter((entry) => typeof entry === "string");
}
function readText(body) {
	if (!body || typeof body !== "object") return "";
	const output = body.output;
	if (!Array.isArray(output)) {
		const fallback = body.choices?.[0]?.message?.content;
		return typeof fallback === "string" ? fallback : "";
	}
	const chunks = [];
	for (const item of output) {
		if (!item || typeof item !== "object") continue;
		const content = item.content;
		if (typeof content === "string") {
			chunks.push(content);
			continue;
		}
		if (!Array.isArray(content)) continue;
		for (const block of content) {
			if (!block || typeof block !== "object") continue;
			const text = block.text;
			if (typeof text === "string") chunks.push(text);
		}
	}
	return chunks.join("\n");
}
async function callModel(instructions, input, options) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "Live research is not available in this environment.",
		code: "unavailable"
	};
	let lastError = "Live research failed.";
	let lastCode;
	for (const model of MODELS) {
		let response;
		try {
			response = await fetch("https://api.x.ai/v1/responses", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${apiKey}`
				},
				signal: AbortSignal.timeout(options.search ? 11e4 : 45e3),
				body: JSON.stringify({
					model,
					instructions,
					input,
					max_output_tokens: options.maxOutput,
					...options.search ? { tools: [{ type: "web_search" }] } : {}
				})
			});
		} catch {
			return {
				ok: false,
				error: "Live research timed out before a catalog came back.",
				code: "timeout"
			};
		}
		const raw = await response.text();
		let body = null;
		try {
			body = JSON.parse(raw);
		} catch {
			body = null;
		}
		if (!response.ok) {
			const record = body && typeof body === "object" ? body : {};
			const message = typeof record.error === "string" ? record.error : `Research service error ${response.status}.`;
			const code = typeof record.code === "string" ? record.code : void 0;
			lastError = message;
			lastCode = code;
			if ((response.status === 400 || response.status === 404 ? /model/i.test(message) : false) && model !== MODELS[MODELS.length - 1]) continue;
			if (code?.includes("spending-limit") || /credit/i.test(message)) return {
				ok: false,
				code: "credits",
				error: "Live search did not run. The research account has no credits left, so nothing was invented in its place."
			};
			return {
				ok: false,
				error: message,
				code
			};
		}
		const text = readText(body).trim();
		if (!text) return {
			ok: false,
			error: "The scout returned an empty response.",
			code: "empty"
		};
		return {
			ok: true,
			text,
			citations: readCitations(body)
		};
	}
	return {
		ok: false,
		error: lastError,
		code: lastCode
	};
}
var scoutWild_createServerFn_handler = createServerRpc({
	id: "d8503f2f17fceabc5f8447f40de64a627b2af398a052ad5158014a950dbc7358",
	name: "scoutWild",
	filename: "src/lib/wild/live.ts"
}, (opts) => scoutWild.__executeServer(opts));
var scoutWild = createServerFn({ method: "POST" }).validator((input) => {
	const parsed = scoutInput.safeParse(input);
	if (!parsed.success) throw new Error("Name a target in a few words. Keep the arsenal short.");
	return parsed.data;
}).handler(scoutWild_createServerFn_handler, async ({ data }) => {
	const maxOutput = data.gear === "needle" ? 2800 : data.gear === "digest" ? 4200 : 6400;
	const arsenal = {
		tools: data.operator.tools,
		hardware: data.operator.hardware,
		subscriptions: data.operator.subscriptions,
		constraints: data.operator.constraints
	};
	const result = await callModel(SCOUT_INSTRUCTIONS, `${gearOrders(data.gear)}\n\nTarget: ${data.target}\n\nArsenal:\n${JSON.stringify(arsenal)}`, {
		search: true,
		maxOutput
	});
	if (!result.ok) return result;
	try {
		const parsed = parseScoutPayload(result.text, {
			gear: data.gear,
			target: data.target,
			operator: {
				...data.operator,
				portrait: ""
			}
		});
		return {
			ok: true,
			items: parsed.items,
			droppedThin: parsed.droppedThin,
			citations: result.citations
		};
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : "The catalog could not be read.",
			code: "parse"
		};
	}
});
var IMAGINE_INSTRUCTIONS = `You restate a reduced research catalog. You do not search. You do not add techniques that are not in the catalog. You do not drop a fail case that is present. You do not give a pep talk.

Return JSON only:
{"sections":[{"heading":"Today","body":""},{"heading":"If the software moves","body":""},{"heading":"Modest hardware or subscription","body":""},{"heading":"Fail cases to keep open","body":""}]}

If a section has nothing, set body to "Nothing in the reduced catalog." Plain sentences.`;
var imagineWild_createServerFn_handler = createServerRpc({
	id: "9dd615675232ca360f4495149f339c8d79c00803374aa93a867663b5c0e9a6cd",
	name: "imagineWild",
	filename: "src/lib/wild/live.ts"
}, (opts) => imagineWild.__executeServer(opts));
var imagineWild = createServerFn({ method: "POST" }).validator((input) => {
	const parsed = imagineInput.safeParse(input);
	if (!parsed.success) throw new Error("There is no reduced catalog to restate.");
	return parsed.data;
}).handler(imagineWild_createServerFn_handler, async ({ data }) => {
	const localItems = data.items.map((item) => ({
		title: item.title,
		horizon: item.horizon,
		execute: item.execute,
		gaps: item.gaps,
		fail: item.fail,
		restrictions: item.restrictions
	}));
	const fallback = (note) => composeLocal(localItems, data.scope, note);
	const result = await callModel(IMAGINE_INSTRUCTIONS, `Scope: ${data.scope}\n\nCatalog:\n${JSON.stringify(data.items)}`, {
		search: false,
		maxOutput: 1400
	});
	if (!result.ok) return {
		ok: true,
		restatement: fallback(result.code === "credits" ? "Composed from the reduced catalog. Live restatement has no credits, so a model did not write this." : "Composed from the reduced catalog. The restatement model did not run.")
	};
	try {
		const start = result.text.indexOf("{");
		const end = result.text.lastIndexOf("}");
		const parsed = JSON.parse(result.text.slice(start, end + 1));
		const incoming = new Map((parsed.sections ?? []).map((section) => [section.heading ?? "", section.body ?? ""]));
		const sections = SECTION_HEADINGS.map((heading) => ({
			heading,
			body: (incoming.get(heading) ?? "").trim() || "Nothing in the reduced catalog."
		}));
		return {
			ok: true,
			restatement: {
				source: "model",
				scope: data.scope,
				note: "Restated from the reduced catalog only.",
				sections
			}
		};
	} catch {
		return {
			ok: true,
			restatement: composeLocal(localItems, data.scope, "Composed from the reduced catalog. The model reply could not be read.")
		};
	}
});
//#endregion
export { imagineWild_createServerFn_handler, scoutWild_createServerFn_handler };
