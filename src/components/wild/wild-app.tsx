import { useLayoutEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Arsenal } from "@/components/wild/arsenal";
import { arsenalEmpty, cleanUrl, isPortraitSrc, isSubstantialFail, normalizeDraft, reconcileUses, guardBench } from "@/lib/wild/bench";
import { imagineWild, scoutWild } from "@/lib/wild/live";
import { reduceStockpile } from "@/lib/wild/reduce";
import { composeLocal } from "@/lib/wild/restate";
import { useWild } from "@/lib/wild/store";
import {
  GEAR_META,
  GEARS,
  HORIZON_LABEL,
  HORIZONS,
  KINDS,
  type Horizon,
  type Kind,
  type ReducedItem,
  type WildItem,
} from "@/lib/wild/types";

const fieldClass =
  "min-h-11 w-full rounded-lg border border-line bg-inset px-3 text-sm text-ink placeholder:text-faint";

const primaryButton =
  "min-h-11 rounded-lg bg-ink px-4 text-sm font-medium text-canvas disabled:cursor-not-allowed disabled:opacity-40";

const quietButton =
  "min-h-11 rounded-lg border border-line px-4 text-sm font-medium text-ink disabled:cursor-not-allowed disabled:opacity-40";

function horizonClass(horizon: Horizon): string {
  return horizon === "informational-fail" ? "text-danger" : "text-ink";
}

export function WildApp() {
  const operator = useWild((state) => state.operator);
  const gear = useWild((state) => state.gear);
  const setGear = useWild((state) => state.setGear);
  const items = useWild((state) => state.items);
  const reduced = useWild((state) => state.reduced);
  const reducedScope = useWild((state) => state.reducedScope);
  const restatement = useWild((state) => state.restatement);
  const runs = useWild((state) => state.runs);
  const fileItems = useWild((state) => state.fileItems);
  const fileHand = useWild((state) => state.fileHand);
  const clearStockpile = useWild((state) => state.clearStockpile);
  const setReduced = useWild((state) => state.setReduced);
  const setRestatement = useWild((state) => state.setRestatement);

  const scout = useServerFn(scoutWild);
  const imagine = useServerFn(imagineWild);

  const [target, setTarget] = useState("");
  const [scope, setScope] = useState("all");
  const [view, setView] = useState<"stockpile" | "reduced">("stockpile");
  const [horizon, setHorizon] = useState<Horizon | "all">("all");
  const [bleedingOnly, setBleedingOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"scout" | "imagine" | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [creditsBlocked, setCreditsBlocked] = useState(false);

  useLayoutEffect(() => {
    void useWild.persist.rehydrate();
  }, []);

  const targets = useMemo(() => {
    const seen: string[] = [];
    for (const item of items) {
      if (!seen.includes(item.target)) seen.push(item.target);
    }
    return seen;
  }, [items]);

  const pool = scope === "all" ? items : items.filter((item) => item.target === scope);
  const reductionMatches = reduced !== null && reducedScope === scope;
  const baseList: Array<WildItem | ReducedItem> =
    view === "reduced" && reductionMatches ? reduced : pool;
  const shown = baseList.filter((item) => {
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
      const result = await scout({
        data: {
          gear,
          target: query,
          operator: {
            name: operator.name,
            tools: operator.tools,
            hardware: operator.hardware,
            subscriptions: operator.subscriptions,
            constraints: operator.constraints,
          },
        },
      });
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
        droppedThin: result.droppedThin,
      });
      setScope(query);
      setView("stockpile");
      setSelectedId(null);
      const notes = [
        `${GEAR_META[gear].label} filed ${result.items.length}.`,
        result.droppedThin > 0
          ? `${result.droppedThin} thin fail notes were left out.`
          : "",
        droppedOldest > 0 ? `${droppedOldest} oldest filings were dropped.` : "",
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
    setNotice(
      next.length === pool.length
        ? "Reduced. Nothing was a duplicate."
        : `Reduced ${pool.length} filings to ${next.length}. Fail cases with a real trap were kept.`,
    );
  };

  const scopeLabel = scope === "all" ? "All targets" : scope;

  const runRestate = () => {
    if (!reductionMatches || !reduced) return;
    setRestatement(
      composeLocal(
        reduced,
        scopeLabel,
        "Composed here from the reduced catalog. No model was asked.",
      ),
    );
    setError("");
  };

  const runImagine = async () => {
    if (!reductionMatches || !reduced || busy) return;
    if (creditsBlocked) {
      setRestatement(
        composeLocal(
          reduced,
          scopeLabel,
          "Composed from the reduced catalog. Live restatement has no credits, so a model did not write this.",
        ),
      );
      return;
    }
    setBusy("imagine");
    setError("");
    try {
      const result = await imagine({
        data: {
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
            bleeding: item.bleeding,
          })),
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.restatement.source === "local" && /credits/i.test(result.restatement.note)) {
        setCreditsBlocked(true);
      }
      setRestatement(result.restatement);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The imaginer did not run.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-faint uppercase">Research skill</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          What in the Wild
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Stockpile first. Reduce late. Imagine last. Search as if budget were not the
          filter, then bench every filing against the arsenal you actually have.
        </p>
      </header>

      <details className="mt-6 max-w-3xl rounded-3xl border border-line bg-panel p-4">
        <summary className="min-h-11 cursor-pointer text-sm font-medium text-ink">
          Who searches, who reduces, who imagines
        </summary>
        <div className="mt-3 grid gap-3 text-sm text-muted">
          <p>
            <span className="text-ink">Scout.</span> One live pass at the gear you pick.
            It stockpiles. It does not decide what you can afford, and it does not merge
            similar findings. Field appends. It will not run while you are away.
          </p>
          <p>
            <span className="text-ink">Cataloger.</span> The same pass, filing structure,
            locus, and sources. Filing is not reduction.
          </p>
          <p>
            <span className="text-ink">Bench.</span> Tags each filing: today, a software
            change, a modest hardware or subscription change, or a fail case specific
            enough to keep. An empty arsenal cannot be called today.
          </p>
          <p>
            <span className="text-ink">Reducer.</span> You open it, after the pile exists.
            It is local. It merges near-duplicates and ranks by what you can execute. It
            does not invent, and it does not throw away a fail case that names the trap.
          </p>
          <p>
            <span className="text-ink">Imaginer.</span> Last, and optional. It sees only
            the reduced catalog and restates it. It does not search again and it does not
            choose what survives. The plate wears your image if you supplied one.
          </p>
        </div>
      </details>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[272px_minmax(0,1fr)]">
        <div className="order-2 lg:order-1">
          <Arsenal />
        </div>

        <div className="order-1 min-w-0 lg:order-2">
          <form
            className="rounded-3xl border border-line bg-panel p-4"
            onSubmit={(event) => {
              event.preventDefault();
              void runScout();
            }}
          >
            <div className="flex flex-wrap items-end justify-between gap-3">
              <label htmlFor="target" className="text-xs font-medium tracking-wide text-muted uppercase">
                Target
              </label>
              <p className="font-mono text-xs text-faint tabular-nums">
                {emptyArsenal
                  ? "Arsenal empty — today will not be claimed"
                  : `${operator.tools.length} tools · ${operator.hardware.length} machines · ${operator.subscriptions.length} subscriptions`}
              </p>
            </div>
            <textarea
              id="target"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void runScout();
                }
              }}
              rows={3}
              maxLength={400}
              placeholder="A system, technique, or structure to find in the wild"
              className={`${fieldClass} mt-2 resize-y py-3`}
            />

            <div role="radiogroup" aria-label="Gear" className="mt-4 grid grid-cols-3 gap-2">
              {GEARS.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  role="radio"
                  aria-checked={gear === entry}
                  onClick={() => setGear(entry)}
                  className={
                    gear === entry
                      ? "min-h-11 rounded-lg bg-ink px-2 text-sm font-medium text-canvas"
                      : "min-h-11 rounded-lg border border-line px-2 text-sm font-medium text-ink"
                  }
                >
                  {GEAR_META[entry].label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">{GEAR_META[gear].line}</p>
            <p className="mt-1 text-sm text-faint">
              One search. Capped at {GEAR_META[gear].cap} filings. Enter runs it.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="submit" className={`${primaryButton} w-full sm:w-auto`} disabled={busy !== null || target.trim().length < 3}>
                {busy === "scout" ? `Running ${GEAR_META[gear].label.toLowerCase()}` : `Run ${GEAR_META[gear].label.toLowerCase()}`}
              </button>
              {busy === "scout" ? (
                <p className="status-shimmer text-sm" role="status">
                  Scout is on the public web.
                </p>
              ) : null}
            </div>
          </form>

          {error ? (
            <p className="mt-4 rounded-lg border border-line px-3 py-3 text-sm text-ink" role="alert">
              {error}
            </p>
          ) : null}
          {notice ? <p className="mt-4 text-sm text-muted">{notice}</p> : null}

          <section className="mt-4 rounded-3xl border border-line bg-panel p-4" aria-label="Pipeline">
            <ol className="grid gap-2 text-sm sm:grid-cols-5">
              <PipelineStep n="1" label="Scout" hot={items.length > 0} />
              <PipelineStep n="2" label="Catalog" hot={items.length > 0} />
              <PipelineStep n="3" label="Bench" hot={items.length > 0} />
              <PipelineStep n="4" label="Reduce" hot={reductionMatches} />
              <PipelineStep n="5" label="Imagine" hot={restatement !== null} />
            </ol>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                className={quietButton}
                disabled={pool.length === 0}
                onClick={runReduce}
              >
                Reduce {scope === "all" ? "the pile" : "this target"}
              </button>
              <button
                type="button"
                className={quietButton}
                disabled={!reductionMatches || !reduced || reduced.length === 0}
                onClick={runRestate}
              >
                Restate
              </button>
              <button
                type="button"
                className={quietButton}
                disabled={!reductionMatches || !reduced || reduced.length === 0 || busy !== null}
                onClick={() => void runImagine()}
              >
                {busy === "imagine" ? "Asking the imaginer" : "Ask the imaginer"}
              </button>
            </div>
            <p className="mt-3 text-sm text-faint">
              Reduce waits on a pile. Restate waits on a reduction and writes the plate
              here. Ask the imaginer is one extra call, and it may only rephrase.
            </p>
          </section>

          {restatement ? <Plate /> : null}

          <section className="mt-4 rounded-3xl border border-line bg-panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-medium tracking-wide text-muted uppercase">
                Catalog
              </h2>
              <p className="font-mono text-xs text-faint tabular-nums">
                {pool.length} filed
                {reductionMatches && reduced ? ` · ${reduced.length} reduced` : ""}
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={view === "stockpile" ? primaryButton : quietButton}
                onClick={() => setView("stockpile")}
              >
                Stockpile
              </button>
              <button
                type="button"
                className={view === "reduced" ? primaryButton : quietButton}
                onClick={() => setView("reduced")}
                disabled={!reductionMatches}
              >
                Reduced
              </button>
            </div>

            {targets.length > 0 ? (
              <label className="mt-4 block text-xs font-medium tracking-wide text-muted uppercase">
                Scope
                <select
                  value={targets.includes(scope) || scope === "all" ? scope : "all"}
                  onChange={(event) => {
                    setScope(event.target.value);
                    setSelectedId(null);
                  }}
                  className={`${fieldClass} mt-2`}
                >
                  <option value="all">All targets</option>
                  {targets.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <FilterChip active={horizon === "all"} onClick={() => setHorizon("all")}>
                All horizons
              </FilterChip>
              {HORIZONS.map((entry) => (
                <FilterChip
                  key={entry}
                  active={horizon === entry}
                  onClick={() => setHorizon(entry)}
                >
                  {HORIZON_LABEL[entry]}
                </FilterChip>
              ))}
              <FilterChip active={bleedingOnly} onClick={() => setBleedingOnly((value) => !value)}>
                Bleeding edge
              </FilterChip>
            </div>

            {view === "reduced" && !reductionMatches ? (
              <p className="mt-4 text-sm text-muted">
                This scope has not been reduced. The reducer stays shut until you open it.
              </p>
            ) : shown.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                {items.length === 0
                  ? "Nothing filed. Name a target and run a gear, or file a finding by hand. Nothing is invented when search cannot run."
                  : "Nothing in this slice."}
              </p>
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                <ul className={selected ? "hidden lg:block" : "block"}>
                  {shown.map((item) => (
                    <li key={item.id} className="border-t border-line">
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className="flex w-full min-h-11 flex-col items-start gap-1 py-3 text-left"
                        aria-current={selectedId === item.id}
                      >
                        <span className={`font-mono text-xs tracking-wide uppercase ${horizonClass(item.horizon)}`}>
                          {HORIZON_LABEL[item.horizon]}
                          {item.bleeding ? " · Bleeding" : ""}
                          {"collapsedFrom" in item && item.collapsedFrom.length > 1
                            ? ` · Merged ${item.collapsedFrom.length}`
                            : ""}
                        </span>
                        <span className="text-base font-medium text-ink">{item.title}</span>
                        <span className="text-sm text-faint">
                          {item.kind} · {item.locus}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className={selected ? "block" : "hidden lg:block"}>
                  {selected ? (
                    <FilingDetail item={selected} onBack={() => setSelectedId(null)} />
                  ) : (
                    <p className="text-sm text-faint">Select a filing.</p>
                  )}
                </div>
              </div>
            )}

            {latestRun && latestRun.citations.length > 0 ? (
              <div className="mt-4 border-t border-line pt-4">
                <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
                  Pass sources
                </h3>
                <ul className="mt-2 grid gap-1">
                  {latestRun.citations.slice(0, 12).map((url) => (
                    <li key={url} className="truncate text-sm">
                      <a href={url} target="_blank" rel="noreferrer" className="block truncate text-steel underline-offset-4 hover:underline">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <HandFile target={target.trim()} />

            {items.length > 0 ? (
              <div className="mt-4 border-t border-line pt-4">
                {confirmClear ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={quietButton}
                      onClick={() => {
                        clearStockpile();
                        setConfirmClear(false);
                        setSelectedId(null);
                        setNotice("Stockpile cleared. The arsenal stayed.");
                      }}
                    >
                      Confirm clear
                    </button>
                    <button type="button" className={quietButton} onClick={() => setConfirmClear(false)}>
                      Keep
                    </button>
                  </div>
                ) : (
                  <button type="button" className="min-h-11 text-sm text-faint" onClick={() => setConfirmClear(true)}>
                    Clear stockpile
                  </button>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function PipelineStep({ n, label, hot }: { n: string; label: string; hot: boolean }) {
  return (
    <li className={hot ? "text-ink" : "text-faint"}>
      <span className="font-mono text-xs tabular-nums">{n}</span> {label}
    </li>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button type="button" onClick={onClick} className={active ? primaryButton : quietButton} aria-pressed={active}>
      {children}
    </button>
  );
}

function FilingDetail({ item, onBack }: { item: WildItem | ReducedItem; onBack: () => void }) {
  const operator = useWild((state) => state.operator);
  const { matched, outside } = reconcileUses(item.uses, operator);
  return (
    <article className="rounded-lg bg-inset p-4">
      <button type="button" className="mb-3 min-h-11 text-sm text-muted lg:hidden" onClick={onBack}>
        Back to catalog
      </button>
      <p className={`font-mono text-xs tracking-wide uppercase ${horizonClass(item.horizon)}`}>
        {HORIZON_LABEL[item.horizon]} · {item.kind}
        {item.filed === "hand" ? " · Hand filed" : ` · ${GEAR_META[item.gear].label}`}
      </p>
      <h3 className="mt-2 text-xl font-medium tracking-tight text-ink">{item.title}</h3>
      <p className="mt-1 text-sm text-faint">{item.locus}</p>
      <p className="mt-4 text-sm text-ink">{item.claim}</p>
      <h4 className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">Replicate</h4>
      <p className="mt-1 text-sm text-ink">{item.reverse}</p>
      <h4 className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">Execute</h4>
      <p className="mt-1 text-sm text-ink">{item.execute}</p>
      {matched.length > 0 ? (
        <>
          <h4 className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">Fits the arsenal</h4>
          <p className="mt-1 text-sm text-ink">{matched.join(", ")}</p>
        </>
      ) : null}
      {outside.length > 0 || item.gaps.length > 0 ? (
        <>
          <h4 className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">Not in hand</h4>
          <p className="mt-1 text-sm text-ink">{[...outside, ...item.gaps].join(" · ")}</p>
        </>
      ) : null}
      {item.restrictions ? (
        <>
          <h4 className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">Restriction</h4>
          <p className="mt-1 text-sm text-ink">{item.restrictions}</p>
        </>
      ) : null}
      {item.fail ? (
        <>
          <h4 className="mt-4 text-xs font-medium tracking-wide text-danger uppercase">Fail case</h4>
          <p className="mt-1 text-sm text-ink">{item.fail}</p>
        </>
      ) : null}
      {item.sources.length > 0 ? (
        <>
          <h4 className="mt-4 text-xs font-medium tracking-wide text-muted uppercase">Sources</h4>
          <ul className="mt-1 grid gap-1">
            {item.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-steel underline-offset-4 hover:underline"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </article>
  );
}

function Plate() {
  const operator = useWild((state) => state.operator);
  const restatement = useWild((state) => state.restatement);
  const [copied, setCopied] = useState(false);
  if (!restatement) return null;
  const portrait = isPortraitSrc(operator.portrait) ? operator.portrait : "";
  const text = [
    operator.name || "Operator",
    restatement.scope,
    restatement.note,
    ...restatement.sections.flatMap((section) => ["", section.heading, section.body]),
  ].join("\n");

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-line bg-panel" aria-label="Restatement">
      {portrait ? (
        <img
          src={portrait}
          alt={operator.name ? `${operator.name} portrait` : "Operator portrait"}
          className="plate-photo"
        />
      ) : (
        <div className="flex min-h-48 items-end bg-inset p-4 sm:min-h-56">
          <div>
            <p className="text-xs font-medium tracking-wide text-faint uppercase">No image yet</p>
            <p className="mt-2 max-w-md text-3xl font-medium tracking-tight text-ink">
              {operator.name || "Your image leads this plate"}
            </p>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl font-medium tracking-tight text-ink">
              {operator.name || "Restatement"}
            </h2>
            <p className="mt-1 text-sm text-faint">{restatement.scope}</p>
          </div>
          <button
            type="button"
            className={quietButton}
            onClick={() => {
              void navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">{restatement.note}</p>
        <div className="mt-4 grid gap-4">
          {restatement.sections.map((section) => (
            <section key={section.heading}>
              <h3 className="font-mono text-xs tracking-wide text-faint uppercase">{section.heading}</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap text-ink">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function HandFile({ target }: { target: string }) {
  const fileHand = useWild((state) => state.fileHand);
  const operator = useWild((state) => state.operator);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Kind>("technique");
  const [locus, setLocus] = useState("");
  const [claim, setClaim] = useState("");
  const [reverse, setReverse] = useState("");
  const [execute, setExecute] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("software");
  const [fail, setFail] = useState("");
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState("");

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
    const draft = guardBench(
      normalizeDraft({
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
        sources: url.trim() ? [{ title: "Source", url: url.trim() }] : [],
        filed: "hand",
      }),
      operator,
    );
    if (!isSubstantialFail(draft)) {
      setFormError(
        "A fail-only filing has to name the trap: what you would miss, and what you would waste.",
      );
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
      sources: draft.sources,
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

  return (
    <div className="mt-4 border-t border-line pt-4">
      <button type="button" className="min-h-11 text-sm font-medium text-ink" onClick={() => setOpen((value) => !value)}>
        {open ? "Close hand file" : "File a finding by hand"}
      </button>
      {open ? (
        <div className="mt-3 grid gap-3">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className={fieldClass} aria-label="Title" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={kind} onChange={(event) => setKind(event.target.value as Kind)} className={fieldClass} aria-label="Kind">
              {KINDS.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
            <select value={horizon} onChange={(event) => setHorizon(event.target.value as Horizon)} className={fieldClass} aria-label="Horizon">
              {HORIZONS.map((entry) => (
                <option key={entry} value={entry}>
                  {HORIZON_LABEL[entry]}
                </option>
              ))}
            </select>
          </div>
          <input value={locus} onChange={(event) => setLocus(event.target.value)} placeholder="Where it lives" className={fieldClass} aria-label="Locus" />
          <textarea value={claim} onChange={(event) => setClaim(event.target.value)} rows={3} placeholder="What it is, decomposed" className={`${fieldClass} py-3`} aria-label="Claim" />
          <textarea value={reverse} onChange={(event) => setReverse(event.target.value)} rows={3} placeholder="How to replicate it from public material" className={`${fieldClass} py-3`} aria-label="Replication" />
          <textarea value={execute} onChange={(event) => setExecute(event.target.value)} rows={2} placeholder="Smallest thing to run" className={`${fieldClass} py-3`} aria-label="Execute" />
          <textarea value={fail} onChange={(event) => setFail(event.target.value)} rows={3} placeholder="Fail case, only if it names the missed opportunity and the waste" className={`${fieldClass} py-3`} aria-label="Fail case" />
          <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https:// source" className={fieldClass} aria-label="Source URL" inputMode="url" />
          {formError ? (
            <p className="text-sm text-danger" role="alert">
              {formError}
            </p>
          ) : null}
          <button type="button" className={`${primaryButton} w-full sm:w-auto`} onClick={submit}>
            File into {target || "the target"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
