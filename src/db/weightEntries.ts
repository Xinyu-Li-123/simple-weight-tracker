import { db } from "./db";
import type { WeightEntry, WeightUnit } from "../types/weight";

export type WeightEntryInput = {
  date: string;
  weight: number;
  unit: WeightUnit;
  note?: string;
};

export async function upsertWeightEntry(input: WeightEntryInput): Promise<WeightEntry> {
  const now = new Date().toISOString();
  const existing = await db.weightEntries.where("date").equals(input.date).first();

  const entry: WeightEntry = {
    id: existing?.id ?? crypto.randomUUID(),
    date: input.date,
    weight: input.weight,
    unit: input.unit,
    note: input.note?.trim() || undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.weightEntries.put(entry);
  return entry;
}

export function listWeightEntries(): Promise<WeightEntry[]> {
  return db.weightEntries.orderBy("date").reverse().toArray();
}

export function deleteWeightEntry(id: string): Promise<void> {
  return db.weightEntries.delete(id);
}

export async function clearWeightEntries(): Promise<void> {
  await db.weightEntries.clear();
}
