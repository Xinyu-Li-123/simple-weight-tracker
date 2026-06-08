import Dexie, { type Table } from "dexie";
import type { WeightPlan } from "@/types/plan";
import type { WeightEntry } from "@/types/weight";
import { validateWeightEntryNote } from "@/db/weightEntryValidation";

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

    this.weightEntries.hook("creating", (_primaryKey, entry) => {
      validateWeightEntryNote(entry.note);
    });

    this.weightEntries.hook("updating", (modifications, _primaryKey, entry) => {
      const nextNote =
        Object.prototype.hasOwnProperty.call(modifications, "note")
          ? (modifications as Record<string, unknown>).note
          : entry.note;
      validateWeightEntryNote(nextNote);
    });
  }
}

export const db = new WeightTrackerDatabase();
