import assert from "node:assert/strict";
import test from "node:test";
import { guardBench, isSubstantialFail } from "./bench.ts";
import { parseScoutPayload } from "./parse-scout.ts";
import { reduceStockpile } from "./reduce.ts";
import { composeLocal } from "./restate.ts";
import { EMPTY_OPERATOR, type WildItem } from "./types.ts";

function item(partial: Partial<WildItem> & Pick<WildItem, "id" | "title">): WildItem {
  return {
    runId: "run",
    gear: "field",
    target: "boids",
    kind: "technique",
    locus: "a paper",
    claim: "A decomposed claim long enough to be a real filing about this technique.",
    reverse: "Read the paper and reimplement the three rules.",
    bleeding: false,
    horizon: "today",
    uses: ["TypeScript"],
    gaps: [],
    execute: "Implement it in the browser.",
    fail: null,
    restrictions: "",
    sources: [],
    filed: "scout",
    createdAt: 1,
    ...partial,
  };
}

test("reducer merges near-duplicate titles and keeps both sources", () => {
  const reduced = reduceStockpile([
    item({
      id: "a",
      title: "Reynolds boids separation alignment cohesion",
      sources: [{ title: "Paper", url: "https://example.com/a" }],
    }),
    item({
      id: "b",
      title: "Reynolds boids separation alignment",
      sources: [{ title: "Notes", url: "https://example.com/b" }],
      createdAt: 2,
    }),
  ]);
  assert.equal(reduced.length, 1);
  assert.equal(reduced[0].collapsedFrom.length, 2);
  assert.equal(reduced[0].sources.length, 2);
});

test("reducer does not merge different kinds", () => {
  const reduced = reduceStockpile([
    item({ id: "a", title: "Quadtree neighbor search", kind: "structure" }),
    item({ id: "b", title: "Quadtree neighbor search", kind: "method" }),
  ]);
  assert.equal(reduced.length, 2);
});

test("thin fail-only rows are dropped, specific ones stay", () => {
  const thin = item({
    id: "thin",
    title: "Vague impossibility",
    horizon: "informational-fail",
    fail: "Too hard.",
  });
  const thick = item({
    id: "thick",
    title: "License trap on the reference solver",
    horizon: "informational-fail",
    fail: "The only complete public solver is GPL. Linking it into a closed shipping binary blocks the release you actually want, and rewriting the constraint propagator is the part that takes the month. Chasing the binary wastes the week. The opportunity is the data format, which is documented separately.",
  });
  assert.equal(isSubstantialFail(thin), false);
  const reduced = reduceStockpile([thin, thick]);
  assert.equal(reduced.length, 1);
  assert.equal(reduced[0].id, "thick");
});

test("today ranks ahead of modest", () => {
  const reduced = reduceStockpile([
    item({ id: "m", title: "Hosted vector cluster", horizon: "modest" }),
    item({ id: "t", title: "In-process cosine scan", horizon: "today" }),
  ]);
  assert.equal(reduced[0].id, "t");
});

test("empty arsenal cannot be tagged today", () => {
  const guarded = guardBench(
    { horizon: "today" as const, gaps: [] as string[] },
    EMPTY_OPERATOR,
  );
  assert.equal(guarded.horizon, "software");
  assert.equal(guarded.gaps.length, 1);
});

test("scout parser strips fences, drops bad urls, and caps needle", () => {
  const payload = {
    items: Array.from({ length: 8 }, (_, index) => ({
      title: `Technique ${index} with a distinct name`,
      kind: "technique",
      locus: "docs",
      claim: "This claim explains the decomposed structure well enough to file.",
      reverse: "Rebuild it from the documented interface.",
      bleeding: index === 0,
      horizon: "software",
      uses: ["Go"],
      gaps: ["a parser"],
      execute: "Write the parser.",
      fail: null,
      restrictions: "",
      sources: [
        { title: "Docs", url: "https://example.com/docs" },
        { title: "Bad", url: "javascript:alert(1)" },
      ],
    })),
  };
  const parsed = parseScoutPayload("```json\n" + JSON.stringify(payload) + "\n```", {
    gear: "needle",
    target: "parsers",
    operator: { ...EMPTY_OPERATOR, tools: ["Go"] },
  });
  assert.equal(parsed.items.length, 5);
  assert.equal(parsed.items[0].sources.length, 1);
});

test("local restatement keeps four sections", () => {
  const source = item({ id: "t", title: "In-process scan" });
  const plate = composeLocal(
    [
      {
        title: source.title,
        horizon: source.horizon,
        execute: source.execute,
        gaps: source.gaps,
        fail: source.fail,
        restrictions: source.restrictions,
      },
    ],
    "parsers",
    "note",
  );
  assert.equal(plate.sections.length, 4);
  assert.match(plate.sections[0].body, /In-process scan/);
  assert.match(plate.sections[1].body, /Nothing in the reduced catalog/);
});
