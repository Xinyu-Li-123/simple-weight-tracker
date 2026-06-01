import type { WeightEntry } from "../types/weight";

export function createMarkdown(entries: WeightEntry[]): string {
  const rows = entries.map((entry) =>
    `| ${entry.date} | ${entry.weight} kg | ${entry.note ?? ""} |`,
  );
  return ["# Weight Log", "", "| Date | Weight | Note |", "|---|---:|---|", ...rows].join("\n");
}
