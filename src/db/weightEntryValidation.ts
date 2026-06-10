import { E } from "@/i18n/errorCodes";

export const MAX_WEIGHT_ENTRY_NOTE_LENGTH = 1000;

export function validateWeightEntryNote(note: unknown): void {
  if (note === undefined) return;
  if (typeof note !== "string") {
    throw new Error(E.NOTE_TOO_LONG);
  }
  if (note.length > MAX_WEIGHT_ENTRY_NOTE_LENGTH) {
    throw new Error(E.NOTE_TOO_LONG);
  }
}
