import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  EMPTY_OPERATOR,
  type Gear,
  type Operator,
  type ReducedItem,
  type Restatement,
  type RunRecord,
  type WildItem,
} from "./types.ts";

const STOCKPILE_CAP = 80;

type WildState = {
  operator: Operator;
  gear: Gear;
  items: WildItem[];
  reduced: ReducedItem[] | null;
  reducedScope: string | null;
  restatement: Restatement | null;
  runs: RunRecord[];
  setGear: (gear: Gear) => void;
  patchOperator: (patch: Partial<Operator>) => void;
  addTag: (
    key: "tools" | "hardware" | "subscriptions" | "constraints",
    value: string,
  ) => void;
  removeTag: (
    key: "tools" | "hardware" | "subscriptions" | "constraints",
    value: string,
  ) => void;
  fileItems: (
    drafts: Omit<WildItem, "id" | "runId" | "createdAt">[],
    run: Omit<RunRecord, "id" | "at">,
  ) => { droppedOldest: number };
  fileHand: (draft: Omit<WildItem, "id" | "runId" | "createdAt" | "filed">) => void;
  clearStockpile: () => void;
  setReduced: (items: ReducedItem[], scope: string) => void;
  setRestatement: (restatement: Restatement | null) => void;
};

function memoryStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
}

function invalidateDownstream(
  state: Pick<WildState, "reduced" | "restatement" | "reducedScope">,
): Pick<WildState, "reduced" | "restatement" | "reducedScope"> {
  return { reduced: null, restatement: null, reducedScope: null };
}

export const useWild = create<WildState>()(
  persist(
    (set) => ({
      operator: EMPTY_OPERATOR,
      gear: "needle",
      items: [],
      reduced: null,
      reducedScope: null,
      restatement: null,
      runs: [],
      setGear: (gear) => set({ gear }),
      patchOperator: (patch) =>
        set((state) => ({ operator: { ...state.operator, ...patch } })),
      addTag: (key, value) =>
        set((state) => {
          const next = value.trim();
          if (!next || next.length > 80) return state;
          if (state.operator[key].some((entry) => entry.toLowerCase() === next.toLowerCase())) {
            return state;
          }
          if (state.operator[key].length >= 40) return state;
          return {
            operator: {
              ...state.operator,
              [key]: [...state.operator[key], next],
            },
          };
        }),
      removeTag: (key, value) =>
        set((state) => ({
          operator: {
            ...state.operator,
            [key]: state.operator[key].filter((entry) => entry !== value),
          },
        })),
      fileItems: (drafts, run) => {
        let droppedOldest = 0;
        set((state) => {
          const runId = crypto.randomUUID();
          const at = Date.now();
          const filed: WildItem[] = drafts.map((draft) => ({
            ...draft,
            id: crypto.randomUUID(),
            runId,
            createdAt: at,
          }));
          const keys = new Set(
            filed.map((item) => `${item.target.toLowerCase()}::${item.title.toLowerCase()}`),
          );
          const kept = state.items.filter(
            (item) => !keys.has(`${item.target.toLowerCase()}::${item.title.toLowerCase()}`),
          );
          let items = [...filed, ...kept];
          if (items.length > STOCKPILE_CAP) {
            droppedOldest = items.length - STOCKPILE_CAP;
            items = items.slice(0, STOCKPILE_CAP);
          }
          const record: RunRecord = { ...run, id: runId, at };
          return {
            items,
            runs: [record, ...state.runs].slice(0, 40),
            ...invalidateDownstream(state),
          };
        });
        return { droppedOldest };
      },
      fileHand: (draft) =>
        set((state) => {
          const item: WildItem = {
            ...draft,
            filed: "hand",
            id: crypto.randomUUID(),
            runId: "hand",
            createdAt: Date.now(),
          };
          return {
            items: [item, ...state.items].slice(0, STOCKPILE_CAP),
            ...invalidateDownstream(state),
          };
        }),
      clearStockpile: () =>
        set({
          items: [],
          reduced: null,
          reducedScope: null,
          restatement: null,
          runs: [],
        }),
      setReduced: (items, scope) =>
        set({ reduced: items, reducedScope: scope, restatement: null }),
      setRestatement: (restatement) => set({ restatement }),
    }),
    {
      name: "what-in-the-wild",
      skipHydration: true,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage() : localStorage,
      ),
      partialize: (state) => ({
        operator: state.operator,
        gear: state.gear,
        items: state.items,
        reduced: state.reduced,
        reducedScope: state.reducedScope,
        restatement: state.restatement,
        runs: state.runs,
      }),
    },
  ),
);
