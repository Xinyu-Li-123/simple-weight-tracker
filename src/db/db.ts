import Dexie, { type Table } from "dexie";
import type { WeightEntry } from "../types/weight";

class WeightTrackerDatabase extends Dexie {
  weightEntries!: Table<WeightEntry, string>;

  constructor() {
    super("simple-weight-tracker");

    this.version(1).stores({
      weightEntries: "id, date, createdAt, updatedAt",
    });
  }
}

export const db = new WeightTrackerDatabase();
