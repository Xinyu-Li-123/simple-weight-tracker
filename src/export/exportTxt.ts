import type { WeightEntry } from "../types/weight";

export function createTxt(entries: WeightEntry[]): string {
  return entries
    .map((entry) => `${entry.date}: ${entry.weight} ${entry.unit}${entry.note ? ` — ${entry.note}` : ""}`)
    .join("\n");
}
