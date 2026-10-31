export const GEARS = ["needle", "digest", "field"] as const;
export type Gear = (typeof GEARS)[number];

export const HORIZONS = [
  "today",
  "software",
  "modest",
  "informational-fail",
] as const;
export type Horizon = (typeof HORIZONS)[number];

export const KINDS = [
  "concept",
  "structure",
  "technique",
  "method",
  "practice",
] as const;
export type Kind = (typeof KINDS)[number];

export type Source = { title: string; url: string };

export type WildItem = {
  id: string;
  runId: string;
  gear: Gear;
  target: string;
  title: string;
  kind: Kind;
  locus: string;
  claim: string;
  reverse: string;
  bleeding: boolean;
  horizon: Horizon;
  uses: string[];
  gaps: string[];
  execute: string;
  fail: string | null;
  restrictions: string;
  sources: Source[];
  filed: "scout" | "hand";
  createdAt: number;
};

export type ReducedItem = WildItem & { collapsedFrom: string[] };

export type Operator = {
  name: string;
  portrait: string;
  tools: string[];
  hardware: string[];
  subscriptions: string[];
  constraints: string[];
};

export type RunRecord = {
  id: string;
  gear: Gear;
  target: string;
  at: number;
  citations: string[];
  kept: number;
  droppedThin: number;
};

export type Restatement = {
  source: "model" | "local";
  scope: string;
  note: string;
  sections: { heading: string; body: string }[];
};

export const GEAR_META: Record<
  Gear,
  { label: string; line: string; cap: number }
> = {
  needle: {
    label: "Needle",
    line: "Instant. One target. Five filings or fewer.",
    cap: 5,
  },
  digest: {
    label: "Digest",
    line: "Wider, for a short sit. The parts, not an encyclopedia.",
    cap: 10,
  },
  field: {
    label: "Field",
    line: "Broadest pass. Appends to the pile. Does not reduce.",
    cap: 16,
  },
};

export const EMPTY_OPERATOR: Operator = {
  name: "",
  portrait: "",
  tools: [],
  hardware: [],
  subscriptions: [],
  constraints: [],
};

export const SOLO_STACK: Pick<
  Operator,
  "tools" | "hardware" | "subscriptions" | "constraints"
> = {
  tools: ["Go", "TypeScript", "Ollama", "git", "a browser"],
  hardware: ["one laptop", "one consumer GPU"],
  subscriptions: [],
  constraints: ["one operator", "no always-on cluster"],
};

export const HORIZON_LABEL: Record<Horizon, string> = {
  today: "Today",
  software: "Software",
  modest: "Modest",
  "informational-fail": "Fail case",
};

export const SECTION_HEADINGS = [
  "Today",
  "If the software moves",
  "Modest hardware or subscription",
  "Fail cases to keep open",
] as const;
