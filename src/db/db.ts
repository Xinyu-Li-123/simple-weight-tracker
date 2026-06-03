import Dexie, { type Table } from "dexie";
import type { WeightPlan } from "../types/plan";
import type { WeightEntry } from "../types/weight";

class WeightTrackerDatabase extends Dexie {
  weightEntries!: Table<WeightEntry, string>;
  weightPlans!: Table<WeightPlan, string>;

  constructor() {
    super("simple-weight-tracker");

    this.version(1).stores({
      weightEntries: "id, date, createdAt, updatedAt",
    });

    this.version(2).stores({
      weightEntries: "id, date, createdAt, updatedAt",
      weightPlans: "id, updatedAt",
    });
  }
}

export const db = new WeightTrackerDatabase();
