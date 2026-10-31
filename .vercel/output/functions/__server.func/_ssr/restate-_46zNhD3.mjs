//#region node_modules/.nitro/vite/services/ssr/assets/restate-_46zNhD3.js
var LIMITS = {
	title: 140,
	locus: 200,
	claim: 1200,
	reverse: 1200,
	execute: 500,
	fail: 1500,
	restrictions: 400,
	tag: 80
};
function clip(value, max) {
	const clean = value.replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	return `${clean.slice(0, max - 1).trimEnd()}…`;
}
function cleanUrl(url) {
	try {
		const parsed = new URL(url.trim());
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
		return parsed.toString();
	} catch {
		return null;
	}
}
function isPortraitSrc(src) {
	return src.startsWith("data:image/jpeg") || src.startsWith("data:image/png") || src.startsWith("data:image/webp");
}
function arsenalEmpty(operator) {
	return operator.tools.length === 0 && operator.hardware.length === 0 && operator.subscriptions.length === 0;
}
/** Fail-only rows survive only when they name a real trap. */
function isSubstantialFail(item) {
	if (item.horizon !== "informational-fail") return true;
	return (item.fail?.trim().length ?? 0) >= 120;
}
function guardBench(item, operator) {
	if (!arsenalEmpty(operator) || item.horizon !== "today") return item;
	const note = "Arsenal is empty, so today cannot be claimed.";
	if (item.gaps.includes(note)) return item;
	return {
		...item,
		horizon: "software",
		gaps: [...item.gaps, note]
	};
}
function reconcileUses(uses, operator) {
	const arsenal = [
		...operator.tools,
		...operator.hardware,
		...operator.subscriptions
	].map((entry) => entry.toLowerCase());
	const matched = [];
	const outside = [];
	for (const use of uses) {
		const needle = use.toLowerCase();
		(arsenal.some((entry) => entry.includes(needle) || needle.includes(entry)) ? matched : outside).push(use);
	}
	return {
		matched,
		outside
	};
}
function normalizeDraft(draft) {
	const sources = [];
	const seen = /* @__PURE__ */ new Set();
	for (const source of draft.sources) {
		const url = cleanUrl(source.url);
		if (!url || seen.has(url)) continue;
		seen.add(url);
		sources.push({
			title: clip(source.title || url, 140) || url,
			url
		});
	}
	const fail = draft.fail ? clip(draft.fail, LIMITS.fail) : null;
	return {
		...draft,
		title: clip(draft.title, LIMITS.title),
		locus: clip(draft.locus, LIMITS.locus),
		claim: clip(draft.claim, LIMITS.claim),
		reverse: clip(draft.reverse, LIMITS.reverse),
		execute: clip(draft.execute, LIMITS.execute),
		restrictions: clip(draft.restrictions, LIMITS.restrictions),
		fail: fail && fail.length > 0 ? fail : null,
		uses: draft.uses.map((tag) => clip(tag, LIMITS.tag)).filter(Boolean).slice(0, 12),
		gaps: draft.gaps.map((tag) => clip(tag, 160)).filter(Boolean).slice(0, 12),
		sources
	};
}
var GEARS = [
	"needle",
	"digest",
	"field"
];
var HORIZONS = [
	"today",
	"software",
	"modest",
	"informational-fail"
];
var KINDS = [
	"concept",
	"structure",
	"technique",
	"method",
	"practice"
];
var GEAR_META = {
	needle: {
		label: "Needle",
		line: "Instant. One target. Five filings or fewer.",
		cap: 5
	},
	digest: {
		label: "Digest",
		line: "Wider, for a short sit. The parts, not an encyclopedia.",
		cap: 10
	},
	field: {
		label: "Field",
		line: "Broadest pass. Appends to the pile. Does not reduce.",
		cap: 16
	}
};
var EMPTY_OPERATOR = {
	name: "",
	portrait: "",
	tools: [],
	hardware: [],
	subscriptions: [],
	constraints: []
};
var SOLO_STACK = {
	tools: [
		"Go",
		"TypeScript",
		"Ollama",
		"git",
		"a browser"
	],
	hardware: ["one laptop", "one consumer GPU"],
	subscriptions: [],
	constraints: ["one operator", "no always-on cluster"]
};
var HORIZON_LABEL = {
	today: "Today",
	software: "Software",
	modest: "Modest",
	"informational-fail": "Fail case"
};
var SECTION_HEADINGS = [
	"Today",
	"If the software moves",
	"Modest hardware or subscription",
	"Fail cases to keep open"
];
function block(items, render) {
	if (items.length === 0) return "Nothing in the reduced catalog.";
	return items.map(render).join("\n\n");
}
function line(item, extra) {
	return [
		item.title.endsWith(".") ? item.title : `${item.title}.`,
		item.execute,
		extra,
		item.restrictions
	].filter(Boolean).join(" ");
}
/** Deterministic restatement. Used when the model is not asked, or cannot run. */
function composeLocal(items, scope, note) {
	const today = items.filter((item) => item.horizon === "today");
	const software = items.filter((item) => item.horizon === "software");
	const modest = items.filter((item) => item.horizon === "modest");
	const fails = items.filter((item) => (item.fail?.trim().length ?? 0) >= 40);
	return {
		source: "local",
		scope,
		note,
		sections: [
			{
				heading: "Today",
				body: block(today, (item) => line(item))
			},
			{
				heading: "If the software moves",
				body: block(software, (item) => line(item, item.gaps.length ? `Needs: ${item.gaps.join("; ")}.` : ""))
			},
			{
				heading: "Modest hardware or subscription",
				body: block(modest, (item) => line(item, item.gaps.length ? `Delta: ${item.gaps.join("; ")}.` : ""))
			},
			{
				heading: "Fail cases to keep open",
				body: fails.length === 0 ? "Nothing in the reduced catalog." : fails.map((item) => `${item.title} — ${item.fail}`).join("\n\n")
			}
		]
	};
}
//#endregion
export { HORIZON_LABEL as a, SOLO_STACK as c, composeLocal as d, guardBench as f, reconcileUses as g, normalizeDraft as h, HORIZONS as i, arsenalEmpty as l, isSubstantialFail as m, GEARS as n, KINDS as o, isPortraitSrc as p, GEAR_META as r, SECTION_HEADINGS as s, EMPTY_OPERATOR as t, cleanUrl as u };
