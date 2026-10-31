import type { Restatement } from "./types.ts";

export type RestateInput = {
  title: string;
  horizon: string;
  execute: string;
  gaps: string[];
  fail: string | null;
  restrictions: string;
};

function block(items: RestateInput[], render: (item: RestateInput) => string): string {
  if (items.length === 0) return "Nothing in the reduced catalog.";
  return items.map(render).join("\n\n");
}

function line(item: RestateInput, extra?: string): string {
  const title = item.title.endsWith(".") ? item.title : `${item.title}.`;
  return [title, item.execute, extra, item.restrictions].filter(Boolean).join(" ");
}

/** Deterministic restatement. Used when the model is not asked, or cannot run. */
export function composeLocal(
  items: RestateInput[],
  scope: string,
  note: string,
): Restatement {
  const today = items.filter((item) => item.horizon === "today");
  const software = items.filter((item) => item.horizon === "software");
  const modest = items.filter((item) => item.horizon === "modest");
  const fails = items.filter((item) => (item.fail?.trim().length ?? 0) >= 40);

  return {
    source: "local",
    scope,
    note,
    sections: [
      { heading: "Today", body: block(today, (item) => line(item)) },
      {
        heading: "If the software moves",
        body: block(software, (item) =>
          line(item, item.gaps.length ? `Needs: ${item.gaps.join("; ")}.` : ""),
        ),
      },
      {
        heading: "Modest hardware or subscription",
        body: block(modest, (item) =>
          line(item, item.gaps.length ? `Delta: ${item.gaps.join("; ")}.` : ""),
        ),
      },
      {
        heading: "Fail cases to keep open",
        body:
          fails.length === 0
            ? "Nothing in the reduced catalog."
            : fails.map((item) => `${item.title} — ${item.fail}`).join("\n\n"),
      },
    ],
  };
}
