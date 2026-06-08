import type { WeightEntry } from "@/types/weight";

function escapeCsv(value: string | number | undefined): string {
  const text = value === undefined ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export function createCsv(entries: WeightEntry[]): string {
  const header = ["date", "weightKg", "note", "createdAt", "updatedAt"];
  const rows = entries.map((entry) => [
    entry.date,
    entry.weight,
    entry.note,
    entry.createdAt,
    entry.updatedAt,
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}
