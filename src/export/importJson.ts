import { db } from "../db/db";
import { isWeightPlan } from "../db/weightPlan";
import type { WeightPlan } from "../types/plan";
import type { WeightEntry } from "../types/weight";
import { CURRENT_BACKUP_SCHEMA_VERSION } from "./exportJson";

type BackupFile = {
  app?: unknown;
  schemaVersion?: unknown;
  entries?: unknown;
  plan?: unknown;
};

export type ImportJsonResult = {
  entriesCount: number;
  importedPlan: boolean;
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

export async function importJsonBackupText(text: string): Promise<ImportJsonResult> {
  const parsed = JSON.parse(text) as BackupFile;

  if (parsed.app !== "simple-weight-tracker" || parsed.schemaVersion !== CURRENT_BACKUP_SCHEMA_VERSION) {
    throw new Error("Unsupported backup file. Export a new backup from the latest app version.");
  }

  if (!Array.isArray(parsed.entries)) {
    throw new Error("Backup entries are missing or invalid.");
  }

  if (!parsed.entries.every(isWeightEntry)) {
    throw new Error("Backup contains invalid entries.");
  }

  if (!("plan" in parsed)) {
    throw new Error("Backup plan field is missing.");
  }

  if (parsed.plan !== null && !isWeightPlan(parsed.plan)) {
    throw new Error("Backup contains an invalid plan.");
  }

  const entries = parsed.entries as WeightEntry[];
  const plan = parsed.plan as WeightPlan | null;

  await db.transaction("rw", db.weightEntries, db.weightPlans, async () => {
    await db.weightEntries.clear();
    await db.weightPlans.clear();

    if (entries.length > 0) {
      await db.weightEntries.bulkPut(entries);
    }

    if (plan) {
      await db.weightPlans.put(plan);
    }
  });

  return {
    entriesCount: entries.length,
    importedPlan: Boolean(plan),
  };
}
