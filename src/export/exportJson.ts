import type { WeightEntry } from "../types/weight";

export type WeightTrackerBackup = {
  app: "simple-weight-tracker";
  schemaVersion: 1;
  exportedAt: string;
  entries: WeightEntry[];
};

export function createJsonBackup(entries: WeightEntry[]): string {
  return JSON.stringify(
    {
      app: "simple-weight-tracker",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      entries,
    } satisfies WeightTrackerBackup,
    null,
    2,
  );
}
