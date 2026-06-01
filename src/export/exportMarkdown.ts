import type { WeightEntry } from "../types/weight";

export function createMarkdown(entries: WeightEntry[]): string {
  const rows = entries.map((entry) =>
    `| ${entry.date} | ${entry.weight} | ${entry.unit} | ${entry.note ?? ""} |`,
  );
  return ["# Weight Log", "", "| Date | Weight | Unit | Note |", "|---|---:|---|---|", ...rows].join("\n");
}
