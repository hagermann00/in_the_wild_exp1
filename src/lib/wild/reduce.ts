import type { Horizon, ReducedItem, WildItem } from "./types.ts";

const RANK: Record<Horizon, number> = {
  today: 0,
  software: 1,
  modest: 2,
  "informational-fail": 3,
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((word) => word.length > 3);
}

function overlap(a: string, b: string): number {
  const left = tokens(a);
  const right = new Set(tokens(b));
  if (left.length === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  return shared / Math.min(left.length, right.size);
}

function similar(a: WildItem, b: WildItem): boolean {
  if (a.kind !== b.kind) return false;
  const left = normalize(a.title);
  const right = normalize(b.title);
  if (
    left.length > 8 &&
    right.length > 8 &&
    (left.includes(right) || right.includes(left))
  ) {
    return true;
  }
  return overlap(a.title, b.title) >= 0.67;
}

function union(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (!value || seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

function pickPrimary(cluster: WildItem[]): WildItem {
  return [...cluster].sort((a, b) => {
    const byHorizon = RANK[a.horizon] - RANK[b.horizon];
    if (byHorizon !== 0) return byHorizon;
    return b.reverse.length - a.reverse.length;
  })[0];
}

function collapse(cluster: WildItem[]): ReducedItem {
  const primary = pickPrimary(cluster);
  const fails = cluster
    .map((item) => item.fail?.trim() ?? "")
    .filter((fail) => fail.length > 0)
    .sort((a, b) => b.length - a.length);
  const also = cluster
    .filter((item) => item.id !== primary.id)
    .filter((item) => overlap(item.claim, primary.claim) < 0.5 && item.claim.length > 80)
    .slice(0, 2)
    .map((item) => item.claim);
  const loci = union(cluster.map((item) => item.locus)).slice(0, 3);
  const sources = union(
    cluster.flatMap((item) => item.sources.map((source) => source.url)),
  ).map((url) => {
    const found = cluster
      .flatMap((item) => item.sources)
      .find((source) => source.url === url);
    return found ?? { title: url, url };
  });

  return {
    ...primary,
    createdAt: Math.min(...cluster.map((item) => item.createdAt)),
    bleeding: cluster.some((item) => item.bleeding),
    claim: also.length > 0 ? `${primary.claim}\n\nAlso filed: ${also.join(" ")}` : primary.claim,
    locus: loci.join(" · "),
    uses: union(cluster.flatMap((item) => item.uses)),
    gaps: union(cluster.flatMap((item) => item.gaps)),
    restrictions: union(
      cluster.map((item) => item.restrictions).filter(Boolean),
    ).join(" "),
    fail: fails[0] ?? null,
    sources,
    collapsedFrom: cluster.map((item) => item.id),
  };
}

function compare(a: ReducedItem, b: ReducedItem): number {
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
export function reduceStockpile(items: WildItem[]): ReducedItem[] {
  const clusters: WildItem[][] = [];
  for (const item of items) {
    if (
      item.horizon === "informational-fail" &&
      (item.fail?.trim().length ?? 0) < 120
    ) {
      continue;
    }
    const cluster = clusters.find((group) => similar(group[0], item));
    if (cluster) cluster.push(item);
    else clusters.push([item]);
  }
  return clusters.map(collapse).sort(compare);
}
