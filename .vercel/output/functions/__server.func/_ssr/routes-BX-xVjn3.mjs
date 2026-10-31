import { i as __toESM } from "../_runtime.mjs";
import { U as isRedirect, b as require_jsx_runtime, q as require_react, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as HORIZON_LABEL, c as SOLO_STACK, d as composeLocal, f as guardBench, g as reconcileUses, h as normalizeDraft, i as HORIZONS, l as arsenalEmpty, m as isSubstantialFail, n as GEARS, o as KINDS, p as isPortraitSrc, r as GEAR_META, t as EMPTY_OPERATOR, u as cleanUrl } from "./restate-_46zNhD3.mjs";
import { n as array, o as object, r as boolean, s as string, t as _enum } from "../_libs/zod.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BX-xVjn3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var STOCKPILE_CAP = 80;
function memoryStorage() {
	return {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {}
	};
}
function invalidateDownstream(state) {
	return {
		reduced: null,
		restatement: null,
		reducedScope: null
	};
}
var useWild = create()(persist((set) => ({
	operator: EMPTY_OPERATOR,
	gear: "needle",
	items: [],
	reduced: null,
	reducedScope: null,
	restatement: null,
	runs: [],
	setGear: (gear) => set({ gear }),
	patchOperator: (patch) => set((state) => ({ operator: {
		...state.operator,
		...patch
	} })),
	addTag: (key, value) => set((state) => {
		const next = value.trim();
		if (!next || next.length > 80) return state;
		if (state.operator[key].some((entry) => entry.toLowerCase() === next.toLowerCase())) return state;
		if (state.operator[key].length >= 40) return state;
		return { operator: {
			...state.operator,
			[key]: [...state.operator[key], next]
		} };
	}),
	removeTag: (key, value) => set((state) => ({ operator: {
		...state.operator,
		[key]: state.operator[key].filter((entry) => entry !== value)
	} })),
	fileItems: (drafts, run) => {
		let droppedOldest = 0;
		set((state) => {
			const runId = crypto.randomUUID();
			const at = Date.now();
			const filed = drafts.map((draft) => ({
				...draft,
				id: crypto.randomUUID(),
				runId,
				createdAt: at
			}));
			const keys = new Set(filed.map((item) => `${item.target.toLowerCase()}::${item.title.toLowerCase()}`));
			const kept = state.items.filter((item) => !keys.has(`${item.target.toLowerCase()}::${item.title.toLowerCase()}`));
			let items = [...filed, ...kept];
			if (items.length > STOCKPILE_CAP) {
				droppedOldest = items.length - STOCKPILE_CAP;
				items = items.slice(0, STOCKPILE_CAP);
			}
			const record = {
				...run,
				id: runId,
				at
			};
			return {
				items,
				runs: [record, ...state.runs].slice(0, 40),
				...invalidateDownstream(state)
			};
		});
		return { droppedOldest };
	},
	fileHand: (draft) => set((state) => {
		return {
			items: [{
				...draft,
				filed: "hand",
				id: crypto.randomUUID(),
				runId: "hand",
				createdAt: Date.now()
			}, ...state.items].slice(0, STOCKPILE_CAP),
			...invalidateDownstream(state)
		};
	}),
	clearStockpile: () => set({
		items: [],
		reduced: null,
		reducedScope: null,
		restatement: null,
		runs: []
	}),
	setReduced: (items, scope) => set({
		reduced: items,
		reducedScope: scope,
		restatement: null
	}),
	setRestatement: (restatement) => set({ restatement })
}), {
	name: "what-in-the-wild",
	skipHydration: true,
	storage: createJSONStorage(() => typeof window === "undefined" ? memoryStorage() : localStorage),
	partialize: (state) => ({
		operator: state.operator,
		gear: state.gear,
		items: state.items,
		reduced: state.reduced,
		reducedScope: state.reducedScope,
		restatement: state.restatement,
		runs: state.runs
	})
}));
var fieldClass$1 = "min-h-11 w-full rounded-lg border border-line bg-inset px-3 text-sm text-ink placeholder:text-faint";
async function compressPortrait(file) {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, 720 / Math.max(bitmap.width, bitmap.height));
	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Could not read that image.");
	context.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();
	return canvas.toDataURL("image/jpeg", .72);
}
function TagField({ label, hint, values, onAdd, onRemove }) {
	const [draft, setDraft] = (0, import_react.useState)("");
	const commit = () => {
		onAdd(draft);
		setDraft("");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			className: "text-xs font-medium tracking-wide text-muted uppercase",
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-faint",
			children: hint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: draft,
				onChange: (event) => setDraft(event.target.value),
				onKeyDown: (event) => {
					if (event.key === "Enter") {
						event.preventDefault();
						commit();
					}
				},
				maxLength: 80,
				className: fieldClass$1,
				"aria-label": label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: commit,
				className: "min-h-11 shrink-0 rounded-lg border border-line px-3 text-sm font-medium text-ink",
				children: "Add"
			})]
		}),
		values.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 flex flex-wrap gap-2",
			children: values.map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onRemove(value),
				className: "min-h-11 rounded-full border border-line px-3 text-left text-sm text-ink",
				"aria-label": `Remove ${value}`,
				children: value
			}) }, value))
		}) : null
	] });
}
function Arsenal() {
	const operator = useWild((state) => state.operator);
	const patchOperator = useWild((state) => state.patchOperator);
	const addTag = useWild((state) => state.addTag);
	const removeTag = useWild((state) => state.removeTag);
	const [portraitError, setPortraitError] = (0, import_react.useState)("");
	const onPortrait = async (file) => {
		setPortraitError("");
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setPortraitError("Use a JPEG, PNG, or WebP.");
			return;
		}
		if (file.size > 12e6) {
			setPortraitError("That image is too large.");
			return;
		}
		try {
			const src = await compressPortrait(file);
			if (!isPortraitSrc(src)) {
				setPortraitError("Could not store that image.");
				return;
			}
			patchOperator({ portrait: src });
		} catch {
			setPortraitError("Could not read that image.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-3xl border border-line bg-panel p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium tracking-wide text-muted uppercase",
					children: "Arsenal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 text-sm text-ink underline decoration-line underline-offset-4",
					onClick: () => patchOperator(SOLO_STACK),
					children: "Solo local stack"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "The bench only believes what is listed here. Search itself stays wide."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "mt-5 block text-xs font-medium tracking-wide text-muted uppercase",
				children: "Name on the plate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: operator.name,
				onChange: (event) => patchOperator({ name: event.target.value.slice(0, 80) }),
				placeholder: "Your name",
				className: `${fieldClass$1} mt-2`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium tracking-wide text-muted uppercase",
						children: "Image"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-faint",
						children: "Leads the restatement. Supplied by you. Never generated."
					}),
					operator.portrait && isPortraitSrc(operator.portrait) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: operator.portrait,
						alt: operator.name ? `${operator.name} portrait` : "Operator portrait",
						className: "portrait-well mt-3 w-full rounded-lg object-cover"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "portrait-well mt-3 flex items-end rounded-lg bg-inset p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-medium tracking-tight text-ink",
							children: operator.name || "Your image"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-line px-3 text-sm font-medium text-ink",
							children: [operator.portrait ? "Replace image" : "Add image", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/jpeg,image/png,image/webp",
								className: "sr-only",
								onChange: (event) => {
									const file = event.target.files?.[0];
									onPortrait(file);
									event.target.value = "";
								}
							})]
						}), operator.portrait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 rounded-lg px-3 text-sm text-muted",
							onClick: () => patchOperator({ portrait: "" }),
							children: "Remove"
						}) : null]
					}),
					portraitError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-danger",
						role: "alert",
						children: portraitError
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagField, {
						label: "Tools",
						hint: "Languages, models, libraries you can run now.",
						values: operator.tools,
						onAdd: (value) => addTag("tools", value),
						onRemove: (value) => removeTag("tools", value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagField, {
						label: "Hardware",
						hint: "Machines you actually have.",
						values: operator.hardware,
						onAdd: (value) => addTag("hardware", value),
						onRemove: (value) => removeTag("hardware", value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagField, {
						label: "Subscriptions",
						hint: "Leave empty if you are not paying for it.",
						values: operator.subscriptions,
						onAdd: (value) => addTag("subscriptions", value),
						onRemove: (value) => removeTag("subscriptions", value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TagField, {
						label: "Hard limits",
						hint: "Time, money, legal, or operational lines the bench must not cross.",
						values: operator.constraints,
						onAdd: (value) => addTag("constraints", value),
						onRemove: (value) => removeTag("constraints", value)
					})
				]
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
var scoutWild = createServerFn({ method: "POST" }).validator((input) => {
	const parsed = scoutInput.safeParse(input);
	if (!parsed.success) throw new Error("Name a target in a few words. Keep the arsenal short.");
	return parsed.data;
}).handler(createSsrRpc("d8503f2f17fceabc5f8447f40de64a627b2af398a052ad5158014a950dbc7358"));
var imagineWild = createServerFn({ method: "POST" }).validator((input) => {
	const parsed = imagineInput.safeParse(input);
	if (!parsed.success) throw new Error("There is no reduced catalog to restate.");
	return parsed.data;
}).handler(createSsrRpc("9dd615675232ca360f4495149f339c8d79c00803374aa93a867663b5c0e9a6cd"));
var RANK = {
	today: 0,
	software: 1,
	modest: 2,
	"informational-fail": 3
};
function normalize(value) {
	return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function tokens(value) {
	return normalize(value).split(" ").filter((word) => word.length > 3);
}
function overlap(a, b) {
	const left = tokens(a);
	const right = new Set(tokens(b));
	if (left.length === 0 || right.size === 0) return 0;
	let shared = 0;
	for (const word of left) if (right.has(word)) shared += 1;
	return shared / Math.min(left.length, right.size);
}
function similar(a, b) {
	if (a.kind !== b.kind) return false;
	const left = normalize(a.title);
	const right = normalize(b.title);
	if (left.length > 8 && right.length > 8 && (left.includes(right) || right.includes(left))) return true;
	return overlap(a.title, b.title) >= .67;
}
function union(values) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const value of values) {
		const key = value.toLowerCase();
		if (!value || seen.has(key)) continue;
		seen.add(key);
		out.push(value);
	}
	return out;
}
function pickPrimary(cluster) {
	return [...cluster].sort((a, b) => {
		const byHorizon = RANK[a.horizon] - RANK[b.horizon];
		if (byHorizon !== 0) return byHorizon;
		return b.reverse.length - a.reverse.length;
	})[0];
}
function collapse(cluster) {
	const primary = pickPrimary(cluster);
	const fails = cluster.map((item) => item.fail?.trim() ?? "").filter((fail) => fail.length > 0).sort((a, b) => b.length - a.length);
	const also = cluster.filter((item) => item.id !== primary.id).filter((item) => overlap(item.claim, primary.claim) < .5 && item.claim.length > 80).slice(0, 2).map((item) => item.claim);
	const loci = union(cluster.map((item) => item.locus)).slice(0, 3);
	const sources = union(cluster.flatMap((item) => item.sources.map((source) => source.url))).map((url) => {
		return cluster.flatMap((item) => item.sources).find((source) => source.url === url) ?? {
			title: url,
			url
		};
	});
	return {
		...primary,
		createdAt: Math.min(...cluster.map((item) => item.createdAt)),
		bleeding: cluster.some((item) => item.bleeding),
		claim: also.length > 0 ? `${primary.claim}\n\nAlso filed: ${also.join(" ")}` : primary.claim,
		locus: loci.join(" · "),
		uses: union(cluster.flatMap((item) => item.uses)),
		gaps: union(cluster.flatMap((item) => item.gaps)),
		restrictions: union(cluster.map((item) => item.restrictions).filter(Boolean)).join(" "),
		fail: fails[0] ?? null,
		sources,
		collapsedFrom: cluster.map((item) => item.id)
	};
}
function compare(a, b) {
	const byHorizon = RANK[a.horizon] - RANK[b.horizon];
	if (byHorizon !== 0) return byHorizon;
	if (a.bleeding !== b.bleeding) return a.bleeding ? -1 : 1;
	return a.title.localeCompare(b.title);
}
/**
* Late, local, non-imaginative. Merges near-duplicate filings and ranks by
* what can be executed. Never invents. Drops fail-only rows that are too thin
* to protect an opportunity.
*/
function reduceStockpile(items) {
	const clusters = [];
	for (const item of items) {
		if (item.horizon === "informational-fail" && (item.fail?.trim().length ?? 0) < 120) continue;
		const cluster = clusters.find((group) => similar(group[0], item));
		if (cluster) cluster.push(item);
		else clusters.push([item]);
	}
	return clusters.map(collapse).sort(compare);
}
var fieldClass = "min-h-11 w-full rounded-lg border border-line bg-inset px-3 text-sm text-ink placeholder:text-faint";
var primaryButton = "min-h-11 rounded-lg bg-ink px-4 text-sm font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-40";
var quietButton = "min-h-11 rounded-lg border border-line px-4 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40";
function horizonClass(horizon) {
	return horizon === "informational-fail" ? "text-danger" : "text-ink";
}
function WildApp() {
	const operator = useWild((state) => state.operator);
	const gear = useWild((state) => state.gear);
	const setGear = useWild((state) => state.setGear);
	const items = useWild((state) => state.items);
	const reduced = useWild((state) => state.reduced);
	const reducedScope = useWild((state) => state.reducedScope);
	const restatement = useWild((state) => state.restatement);
	const runs = useWild((state) => state.runs);
	const fileItems = useWild((state) => state.fileItems);
	useWild((state) => state.fileHand);
	const clearStockpile = useWild((state) => state.clearStockpile);
	const setReduced = useWild((state) => state.setReduced);
	const setRestatement = useWild((state) => state.setRestatement);
	const scout = useServerFn(scoutWild);
	const imagine = useServerFn(imagineWild);
	const [target, setTarget] = (0, import_react.useState)("");
	const [scope, setScope] = (0, import_react.useState)("all");
	const [view, setView] = (0, import_react.useState)("stockpile");
	const [horizon, setHorizon] = (0, import_react.useState)("all");
	const [bleedingOnly, setBleedingOnly] = (0, import_react.useState)(false);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	const [creditsBlocked, setCreditsBlocked] = (0, import_react.useState)(false);
	(0, import_react.useLayoutEffect)(() => {
		useWild.persist.rehydrate();
	}, []);
	const targets = (0, import_react.useMemo)(() => {
		const seen = [];
		for (const item of items) if (!seen.includes(item.target)) seen.push(item.target);
		return seen;
	}, [items]);
	const pool = scope === "all" ? items : items.filter((item) => item.target === scope);
	const reductionMatches = reduced !== null && reducedScope === scope;
	const shown = (view === "reduced" && reductionMatches ? reduced : pool).filter((item) => {
		if (horizon !== "all" && item.horizon !== horizon) return false;
		if (bleedingOnly && !item.bleeding) return false;
		return true;
	});
	const selected = shown.find((item) => item.id === selectedId) ?? null;
	const latestRun = runs.find((run) => scope === "all" || run.target === scope);
	const emptyArsenal = arsenalEmpty(operator);
	const runScout = async () => {
		const query = target.trim();
		if (query.length < 3 || busy) return;
		setBusy("scout");
		setError("");
		setNotice("");
		setConfirmClear(false);
		try {
			const result = await scout({ data: {
				gear,
				target: query,
				operator: {
					name: operator.name,
					tools: operator.tools,
					hardware: operator.hardware,
					subscriptions: operator.subscriptions,
					constraints: operator.constraints
				}
			} });
			if (!result.ok) {
				if (result.code === "credits") setCreditsBlocked(true);
				setError(result.error);
				return;
			}
			const { droppedOldest } = fileItems(result.items, {
				gear,
				target: query,
				citations: result.citations,
				kept: result.items.length,
				droppedThin: result.droppedThin
			});
			setScope(query);
			setView("stockpile");
			setSelectedId(null);
			const notes = [
				`${GEAR_META[gear].label} filed ${result.items.length}.`,
				result.droppedThin > 0 ? `${result.droppedThin} thin fail notes were left out.` : "",
				droppedOldest > 0 ? `${droppedOldest} oldest filings were dropped.` : ""
			].filter(Boolean);
			setNotice(notes.join(" "));
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "The scout did not run.");
		} finally {
			setBusy(null);
		}
	};
	const runReduce = () => {
		const next = reduceStockpile(pool);
		setReduced(next, scope);
		setView("reduced");
		setSelectedId(null);
		setNotice(next.length === pool.length ? "Reduced. Nothing was a duplicate." : `Reduced ${pool.length} filings to ${next.length}. Fail cases with a real trap were kept.`);
	};
	const scopeLabel = scope === "all" ? "All targets" : scope;
	const runRestate = () => {
		if (!reductionMatches || !reduced) return;
		setRestatement(composeLocal(reduced, scopeLabel, "Composed here from the reduced catalog. No model was asked."));
		setError("");
	};
	const runImagine = async () => {
		if (!reductionMatches || !reduced || busy) return;
		if (creditsBlocked) {
			setRestatement(composeLocal(reduced, scopeLabel, "Composed from the reduced catalog. Live restatement has no credits, so a model did not write this."));
			return;
		}
		setBusy("imagine");
		setError("");
		try {
			const result = await imagine({ data: {
				scope: scopeLabel,
				items: reduced.slice(0, 24).map((item) => ({
					title: item.title,
					horizon: item.horizon,
					kind: item.kind,
					claim: item.claim.slice(0, 600),
					execute: item.execute,
					gaps: item.gaps.slice(0, 8),
					fail: item.fail ? item.fail.slice(0, 800) : null,
					restrictions: item.restrictions,
					bleeding: item.bleeding
				}))
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			if (result.restatement.source === "local" && /credits/i.test(result.restatement.note)) setCreditsBlocked(true);
			setRestatement(result.restatement);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "The imaginer did not run.");
		} finally {
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "max-w-3xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-xs tracking-widest text-faint uppercase",
						children: "Research skill"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl",
						children: "What in the Wild"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-base text-muted",
						children: "Stockpile first. Reduce late. Imagine last. Search as if budget were not the filter, then bench every filing against the arsenal you actually have."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "mt-6 max-w-3xl rounded-3xl border border-line bg-panel p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("summary", {
					className: "min-h-11 cursor-pointer text-sm font-medium text-ink",
					children: "Who searches, who reduces, who imagines"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 grid gap-3 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink",
							children: "Scout."
						}), " One live pass at the gear you pick. It stockpiles. It does not decide what you can afford, and it does not merge similar findings. Field appends. It will not run while you are away."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink",
							children: "Cataloger."
						}), " The same pass, filing structure, locus, and sources. Filing is not reduction."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink",
							children: "Bench."
						}), " Tags each filing: today, a software change, a modest hardware or subscription change, or a fail case specific enough to keep. An empty arsenal cannot be called today."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink",
							children: "Reducer."
						}), " You open it, after the pile exists. It is local. It merges near-duplicates and ranks by what you can execute. It does not invent, and it does not throw away a fail case that names the trap."] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-ink",
							children: "Imaginer."
						}), " Last, and optional. It sees only the reduced catalog and restates it. It does not search again and it does not choose what survives. The plate wears your image if you supplied one."] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid items-start gap-6 lg:grid-cols-[272px_minmax(0,1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "order-2 lg:order-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arsenal, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "order-1 min-w-0 lg:order-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "rounded-3xl border border-line bg-panel p-4",
							onSubmit: (event) => {
								event.preventDefault();
								runScout();
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-end justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "target",
										className: "text-xs font-medium tracking-wide text-muted uppercase",
										children: "Target"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-xs text-faint tabular-nums",
										children: emptyArsenal ? "Arsenal empty — today will not be claimed" : `${operator.tools.length} tools · ${operator.hardware.length} machines · ${operator.subscriptions.length} subscriptions`
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									id: "target",
									value: target,
									onChange: (event) => setTarget(event.target.value),
									onKeyDown: (event) => {
										if (event.key === "Enter" && !event.shiftKey) {
											event.preventDefault();
											runScout();
										}
									},
									rows: 3,
									maxLength: 400,
									placeholder: "A system, technique, or structure to find in the wild",
									className: `${fieldClass} mt-2 resize-y py-3`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									role: "radiogroup",
									"aria-label": "Gear",
									className: "mt-4 grid grid-cols-3 gap-2",
									children: GEARS.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										role: "radio",
										"aria-checked": gear === entry,
										onClick: () => setGear(entry),
										className: gear === entry ? "min-h-11 rounded-lg bg-ink px-2 text-sm font-medium text-canvas" : "min-h-11 rounded-lg border border-line px-2 text-sm font-medium text-ink",
										children: GEAR_META[entry].label
									}, entry))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted",
									children: GEAR_META[gear].line
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-faint",
									children: [
										"One search. Capped at ",
										GEAR_META[gear].cap,
										" filings. Enter runs it."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: `${primaryButton} w-full sm:w-auto`,
										disabled: busy !== null || target.trim().length < 3,
										children: busy === "scout" ? `Running ${GEAR_META[gear].label.toLowerCase()}` : `Run ${GEAR_META[gear].label.toLowerCase()}`
									}), busy === "scout" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "status-shimmer text-sm",
										role: "status",
										children: "Scout is on the public web."
									}) : null]
								})
							]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 rounded-lg border border-line px-3 py-3 text-sm text-ink",
							role: "alert",
							children: error
						}) : null,
						notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted",
							children: notice
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-4 rounded-3xl border border-line bg-panel p-4",
							"aria-label": "Pipeline",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
									className: "grid gap-2 text-sm sm:grid-cols-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
											n: "1",
											label: "Scout",
											hot: items.length > 0
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
											n: "2",
											label: "Catalog",
											hot: items.length > 0
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
											n: "3",
											label: "Bench",
											hot: items.length > 0
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
											n: "4",
											label: "Reduce",
											hot: reductionMatches
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineStep, {
											n: "5",
											label: "Imagine",
											hot: restatement !== null
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid gap-2 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											className: quietButton,
											disabled: pool.length === 0,
											onClick: runReduce,
											children: ["Reduce ", scope === "all" ? "the pile" : "this target"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: quietButton,
											disabled: !reductionMatches || !reduced || reduced.length === 0,
											onClick: runRestate,
											children: "Restate"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: quietButton,
											disabled: !reductionMatches || !reduced || reduced.length === 0 || busy !== null,
											onClick: () => void runImagine(),
											children: busy === "imagine" ? "Asking the imaginer" : "Ask the imaginer"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-faint",
									children: "Reduce waits on a pile. Restate waits on a reduction and writes the plate here. Ask the imaginer is one extra call, and it may only rephrase."
								})
							]
						}),
						restatement ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plate, {}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-4 rounded-3xl border border-line bg-panel p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-medium tracking-wide text-muted uppercase",
										children: "Catalog"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-mono text-xs text-faint tabular-nums",
										children: [
											pool.length,
											" filed",
											reductionMatches && reduced ? ` · ${reduced.length} reduced` : ""
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: view === "stockpile" ? primaryButton : quietButton,
										onClick: () => setView("stockpile"),
										children: "Stockpile"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: view === "reduced" ? primaryButton : quietButton,
										onClick: () => setView("reduced"),
										disabled: !reductionMatches,
										children: "Reduced"
									})]
								}),
								targets.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-4 block text-xs font-medium tracking-wide text-muted uppercase",
									children: ["Scope", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: targets.includes(scope) || scope === "all" ? scope : "all",
										onChange: (event) => {
											setScope(event.target.value);
											setSelectedId(null);
										},
										className: `${fieldClass} mt-2`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "All targets"
										}), targets.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: entry,
											children: entry
										}, entry))]
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
											active: horizon === "all",
											onClick: () => setHorizon("all"),
											children: "All horizons"
										}),
										HORIZONS.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
											active: horizon === entry,
											onClick: () => setHorizon(entry),
											children: HORIZON_LABEL[entry]
										}, entry)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChip, {
											active: bleedingOnly,
											onClick: () => setBleedingOnly((value) => !value),
											children: "Bleeding edge"
										})
									]
								}),
								view === "reduced" && !reductionMatches ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm text-muted",
									children: "This scope has not been reduced. The reducer stays shut until you open it."
								}) : shown.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm text-muted",
									children: items.length === 0 ? "Nothing filed. Name a target and run a gear, or file a finding by hand. Nothing is invented when search cannot run." : "Nothing in this slice."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: selected ? "hidden lg:block" : "block",
										children: shown.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
											className: "border-t border-line",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
												type: "button",
												onClick: () => setSelectedId(item.id),
												className: "flex w-full min-h-11 flex-col items-start gap-1 py-3 text-left",
												"aria-current": selectedId === item.id,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: `font-mono text-xs tracking-wide uppercase ${horizonClass(item.horizon)}`,
														children: [
															HORIZON_LABEL[item.horizon],
															item.bleeding ? " · Bleeding" : "",
															"collapsedFrom" in item && item.collapsedFrom.length > 1 ? ` · Merged ${item.collapsedFrom.length}` : ""
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-base font-medium text-ink",
														children: item.title
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-sm text-faint",
														children: [
															item.kind,
															" · ",
															item.locus
														]
													})
												]
											})
										}, item.id))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: selected ? "block" : "hidden lg:block",
										children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilingDetail, {
											item: selected,
											onBack: () => setSelectedId(null)
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-faint",
											children: "Select a filing."
										})
									})]
								}),
								latestRun && latestRun.citations.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 border-t border-line pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-xs font-medium tracking-wide text-muted uppercase",
										children: "Pass sources"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-2 grid gap-1",
										children: latestRun.citations.slice(0, 12).map((url) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
											className: "truncate text-sm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: url,
												target: "_blank",
												rel: "noreferrer",
												className: "block truncate text-steel underline-offset-4 hover:underline",
												children: url
											})
										}, url))
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandFile, { target: target.trim() }),
								items.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 border-t border-line pt-4",
									children: confirmClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: quietButton,
											onClick: () => {
												clearStockpile();
												setConfirmClear(false);
												setSelectedId(null);
												setNotice("Stockpile cleared. The arsenal stayed.");
											},
											children: "Confirm clear"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: quietButton,
											onClick: () => setConfirmClear(false),
											children: "Keep"
										})]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "min-h-11 text-sm text-faint",
										onClick: () => setConfirmClear(true),
										children: "Clear stockpile"
									})
								}) : null
							]
						})
					]
				})]
			})
		]
	});
}
function PipelineStep({ n, label, hot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: hot ? "text-ink" : "text-faint",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-xs tabular-nums",
				children: n
			}),
			" ",
			label
		]
	});
}
function FilterChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: active ? primaryButton : quietButton,
		"aria-pressed": active,
		children
	});
}
function FilingDetail({ item, onBack }) {
	const operator = useWild((state) => state.operator);
	const { matched, outside } = reconcileUses(item.uses, operator);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg bg-inset p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "mb-3 min-h-11 text-sm text-muted lg:hidden",
				onClick: onBack,
				children: "Back to catalog"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: `font-mono text-xs tracking-wide uppercase ${horizonClass(item.horizon)}`,
				children: [
					HORIZON_LABEL[item.horizon],
					" · ",
					item.kind,
					item.filed === "hand" ? " · Hand filed" : ` · ${GEAR_META[item.gear].label}`
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-2 text-xl font-medium tracking-tight text-ink",
				children: item.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-faint",
				children: item.locus
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-ink",
				children: item.claim
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-4 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Replicate"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink",
				children: item.reverse
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-4 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Execute"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink",
				children: item.execute
			}),
			matched.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-4 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Fits the arsenal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink",
				children: matched.join(", ")
			})] }) : null,
			outside.length > 0 || item.gaps.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-4 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Not in hand"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink",
				children: [...outside, ...item.gaps].join(" · ")
			})] }) : null,
			item.restrictions ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-4 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Restriction"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink",
				children: item.restrictions
			})] }) : null,
			item.fail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-4 text-xs font-medium tracking-wide text-danger uppercase",
				children: "Fail case"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-ink",
				children: item.fail
			})] }) : null,
			item.sources.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mt-4 text-xs font-medium tracking-wide text-muted uppercase",
				children: "Sources"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1 grid gap-1",
				children: item.sources.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: source.url,
					target: "_blank",
					rel: "noreferrer",
					className: "text-sm text-steel underline-offset-4 hover:underline",
					children: source.title
				}) }, source.url))
			})] }) : null
		]
	});
}
function Plate() {
	const operator = useWild((state) => state.operator);
	const restatement = useWild((state) => state.restatement);
	const [copied, setCopied] = (0, import_react.useState)(false);
	if (!restatement) return null;
	const portrait = isPortraitSrc(operator.portrait) ? operator.portrait : "";
	const text = [
		operator.name || "Operator",
		restatement.scope,
		restatement.note,
		...restatement.sections.flatMap((section) => [
			"",
			section.heading,
			section.body
		])
	].join("\n");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4 overflow-hidden rounded-3xl border border-line bg-panel",
		"aria-label": "Restatement",
		children: [portrait ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: portrait,
			alt: operator.name ? `${operator.name} portrait` : "Operator portrait",
			className: "plate-photo"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex min-h-48 items-end bg-inset p-4 sm:min-h-56",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wide text-faint uppercase",
				children: "No image yet"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-3xl font-medium tracking-tight text-ink",
				children: operator.name || "Your image leads this plate"
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-medium tracking-tight text-ink",
						children: operator.name || "Restatement"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-faint",
						children: restatement.scope
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: quietButton,
						onClick: () => {
							navigator.clipboard.writeText(text).then(() => {
								setCopied(true);
								window.setTimeout(() => setCopied(false), 1500);
							});
						},
						children: copied ? "Copied" : "Copy"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: restatement.note
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-4",
					children: restatement.sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-mono text-xs tracking-wide text-faint uppercase",
						children: section.heading
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm whitespace-pre-wrap text-ink",
						children: section.body
					})] }, section.heading))
				})
			]
		})]
	});
}
function HandFile({ target }) {
	const fileHand = useWild((state) => state.fileHand);
	const operator = useWild((state) => state.operator);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("technique");
	const [locus, setLocus] = (0, import_react.useState)("");
	const [claim, setClaim] = (0, import_react.useState)("");
	const [reverse, setReverse] = (0, import_react.useState)("");
	const [execute, setExecute] = (0, import_react.useState)("");
	const [horizon, setHorizon] = (0, import_react.useState)("software");
	const [fail, setFail] = (0, import_react.useState)("");
	const [url, setUrl] = (0, import_react.useState)("");
	const [formError, setFormError] = (0, import_react.useState)("");
	const submit = () => {
		if (target.length < 3) {
			setFormError("Name a target above before filing.");
			return;
		}
		if (title.trim().length < 3 || claim.trim().length < 20 || reverse.trim().length < 10) {
			setFormError("A filing needs a title, a real claim, and how to replicate it.");
			return;
		}
		if (url.trim() && !cleanUrl(url)) {
			setFormError("Source links need to be http or https.");
			return;
		}
		const draft = guardBench(normalizeDraft({
			gear: "needle",
			target,
			title: title.trim(),
			kind,
			locus: locus.trim() || "Hand filed",
			claim: claim.trim(),
			reverse: reverse.trim(),
			bleeding: false,
			horizon,
			uses: [],
			gaps: [],
			execute: execute.trim() || claim.trim(),
			fail: fail.trim() || null,
			restrictions: "",
			sources: url.trim() ? [{
				title: "Source",
				url: url.trim()
			}] : [],
			filed: "hand"
		}), operator);
		if (!isSubstantialFail(draft)) {
			setFormError("A fail-only filing has to name the trap: what you would miss, and what you would waste.");
			return;
		}
		fileHand({
			gear: draft.gear,
			target: draft.target,
			title: draft.title,
			kind: draft.kind,
			locus: draft.locus,
			claim: draft.claim,
			reverse: draft.reverse,
			bleeding: draft.bleeding,
			horizon: draft.horizon,
			uses: draft.uses,
			gaps: draft.gaps,
			execute: draft.execute,
			fail: draft.fail,
			restrictions: draft.restrictions,
			sources: draft.sources
		});
		setTitle("");
		setClaim("");
		setReverse("");
		setExecute("");
		setFail("");
		setUrl("");
		setLocus("");
		setFormError("");
		setOpen(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 border-t border-line pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "min-h-11 text-sm font-medium text-ink",
			onClick: () => setOpen((value) => !value),
			children: open ? "Close hand file" : "File a finding by hand"
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: title,
					onChange: (event) => setTitle(event.target.value),
					placeholder: "Title",
					className: fieldClass,
					"aria-label": "Title"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: kind,
						onChange: (event) => setKind(event.target.value),
						className: fieldClass,
						"aria-label": "Kind",
						children: KINDS.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: entry,
							children: entry
						}, entry))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: horizon,
						onChange: (event) => setHorizon(event.target.value),
						className: fieldClass,
						"aria-label": "Horizon",
						children: HORIZONS.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: entry,
							children: HORIZON_LABEL[entry]
						}, entry))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: locus,
					onChange: (event) => setLocus(event.target.value),
					placeholder: "Where it lives",
					className: fieldClass,
					"aria-label": "Locus"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: claim,
					onChange: (event) => setClaim(event.target.value),
					rows: 3,
					placeholder: "What it is, decomposed",
					className: `${fieldClass} py-3`,
					"aria-label": "Claim"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: reverse,
					onChange: (event) => setReverse(event.target.value),
					rows: 3,
					placeholder: "How to replicate it from public material",
					className: `${fieldClass} py-3`,
					"aria-label": "Replication"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: execute,
					onChange: (event) => setExecute(event.target.value),
					rows: 2,
					placeholder: "Smallest thing to run",
					className: `${fieldClass} py-3`,
					"aria-label": "Execute"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: fail,
					onChange: (event) => setFail(event.target.value),
					rows: 3,
					placeholder: "Fail case, only if it names the missed opportunity and the waste",
					className: `${fieldClass} py-3`,
					"aria-label": "Fail case"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: url,
					onChange: (event) => setUrl(event.target.value),
					placeholder: "https:// source",
					className: fieldClass,
					"aria-label": "Source URL",
					inputMode: "url"
				}),
				formError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					role: "alert",
					children: formError
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `${primaryButton} w-full sm:w-auto`,
					onClick: submit,
					children: ["File into ", target || "the target"]
				})
			]
		}) : null]
	});
}
var SplitComponent = WildApp;
//#endregion
export { SplitComponent as component };
