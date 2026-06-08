import type { WeightPlan } from "@/types/plan";
import type { WeightEntry } from "@/types/weight";

export const CURRENT_BACKUP_SCHEMA_VERSION = 3 as const;

export type WeightTrackerBackup = {
  app: "simple-weight-tracker";
  schemaVersion: typeof CURRENT_BACKUP_SCHEMA_VERSION;
  exportedAt: string;
  entries: WeightEntry[];
  plan: WeightPlan | null;
};

export function createJsonBackup(entries: WeightEntry[], plan: WeightPlan | null): string {
  return JSON.stringify(
    {
      app: "simple-weight-tracker",
      schemaVersion: CURRENT_BACKUP_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      entries,
      plan,
    } satisfies WeightTrackerBackup,
    null,
    2,
  );
}
