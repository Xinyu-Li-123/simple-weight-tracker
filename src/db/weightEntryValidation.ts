export const MAX_WEIGHT_ENTRY_NOTE_LENGTH = 1000;

export const WEIGHT_ENTRY_NOTE_LENGTH_ERROR = `Note must be ${MAX_WEIGHT_ENTRY_NOTE_LENGTH} characters or less.`;

export function validateWeightEntryNote(note: unknown): void {
  if (note === undefined) return;
  if (typeof note !== "string") {
    throw new Error("Invalid note.");
  }
  if (note.length > MAX_WEIGHT_ENTRY_NOTE_LENGTH) {
    throw new Error(WEIGHT_ENTRY_NOTE_LENGTH_ERROR);
  }
}
