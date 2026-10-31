import type { Horizon, Operator, WildItem } from "./types.ts";

const LIMITS = {
  title: 140,
  locus: 200,
  claim: 1200,
  reverse: 1200,
  execute: 500,
  fail: 1500,
  restrictions: 400,
  tag: 80,
} as const;

export function clip(value: string, max: number): string {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function cleanUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isPortraitSrc(src: string): boolean {
  return (
    src.startsWith("data:image/jpeg") ||
    src.startsWith("data:image/png") ||
    src.startsWith("data:image/webp")
  );
}

export function arsenalEmpty(operator: Operator): boolean {
  return (
    operator.tools.length === 0 &&
    operator.hardware.length === 0 &&
    operator.subscriptions.length === 0
  );
}

/** Fail-only rows survive only when they name a real trap. */
export function isSubstantialFail(item: {
  horizon: Horizon;
  fail: string | null;
}): boolean {
  if (item.horizon !== "informational-fail") return true;
  return (item.fail?.trim().length ?? 0) >= 120;
}

export function guardBench<T extends { horizon: Horizon; gaps: string[] }>(
  item: T,
  operator: Operator,
): T {
  if (!arsenalEmpty(operator) || item.horizon !== "today") return item;
  const note = "Arsenal is empty, so today cannot be claimed.";
  if (item.gaps.includes(note)) return item;
  return { ...item, horizon: "software", gaps: [...item.gaps, note] };
}

export function reconcileUses(
  uses: string[],
  operator: Operator,
): { matched: string[]; outside: string[] } {
  const arsenal = [
    ...operator.tools,
    ...operator.hardware,
    ...operator.subscriptions,
  ].map((entry) => entry.toLowerCase());
  const matched: string[] = [];
  const outside: string[] = [];
  for (const use of uses) {
    const needle = use.toLowerCase();
    const hit = arsenal.some(
      (entry) => entry.includes(needle) || needle.includes(entry),
    );
    (hit ? matched : outside).push(use);
  }
  return { matched, outside };
}

export function normalizeDraft(
  draft: Omit<WildItem, "id" | "runId" | "createdAt">,
): Omit<WildItem, "id" | "runId" | "createdAt"> {
  const sources: WildItem["sources"] = [];
  const seen = new Set<string>();
  for (const source of draft.sources) {
    const url = cleanUrl(source.url);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    sources.push({
      title: clip(source.title || url, 140) || url,
      url,
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
    sources,
  };
}
