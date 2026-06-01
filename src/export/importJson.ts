import { db } from "../db/db";
import type { WeightEntry } from "../types/weight";

type BackupFile = {
  app?: unknown;
  schemaVersion?: unknown;
  entries?: unknown;
};

function isWeightEntry(value: unknown): value is WeightEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" &&
    typeof entry.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(entry.date) &&
    typeof entry.weight === "number" &&
    Number.isFinite(entry.weight) &&
    !("unit" in entry) &&
    (entry.note === undefined || typeof entry.note === "string") &&
    typeof entry.createdAt === "string" &&
    typeof entry.updatedAt === "string"
  );
}

export async function importJsonBackupText(text: string): Promise<number> {
  const parsed = JSON.parse(text) as BackupFile;

  if (parsed.app !== "simple-weight-tracker" || parsed.schemaVersion !== 2 || !Array.isArray(parsed.entries)) {
    throw new Error("Invalid backup file.");
  }

  if (!parsed.entries.every(isWeightEntry)) {
    throw new Error("Backup contains invalid entries.");
  }

  await db.transaction("rw", db.weightEntries, async () => {
    await db.weightEntries.bulkPut(parsed.entries as WeightEntry[]);
  });

  return parsed.entries.length;
}
