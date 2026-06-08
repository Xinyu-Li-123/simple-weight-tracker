import { X } from "lucide-react";
import { AddWeightForm, type WeightEntryDraft, type WeightEntryFormMode } from "@/components/AddWeightForm";
import { WeightRecordCard } from "@/components/WeightRecordCard";
import type { WeightEntry } from "@/types/weight";

type Props = {
  open: boolean;
  mode: WeightEntryFormMode;
  entry?: WeightEntry | null;
  prefillDate?: string;
  onClose: () => void;
  onCancelEdit: (entry: WeightEntry) => void;
  onCreate: (input: WeightEntryDraft) => Promise<void>;
  onUpdate: (input: WeightEntryDraft) => Promise<void>;
  onRequestDelete: (entry: WeightEntry) => void;
  onEdit: (entry: WeightEntry) => void;
  defaultDate: string;
};

export function RecordSheet({ open, mode, entry, prefillDate, onClose, onCancelEdit, onCreate, onUpdate, onRequestDelete, onEdit, defaultDate }: Props) {
  if (!open) return null;

  const formValue = entry
    ? { date: entry.date, weight: entry.weight, note: entry.note }
    : prefillDate
      ? { date: prefillDate, weight: undefined as unknown as number, note: undefined }
      : undefined;
  const formKey = entry ? `${mode}:${entry.id}:${entry.updatedAt}` : `${mode}:${prefillDate ?? defaultDate}`;
  const title = mode === "create" ? "Create record" : mode === "edit" ? "Edit record" : "Record details";

  async function handleSave(input: WeightEntryDraft) {
    if (mode === "edit") {
      await onUpdate(input);
      return;
    }

    await onCreate(input);
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <section
        className="sheet"
        aria-labelledby="record-sheet-title"
        aria-modal="true"
        role="dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__header">
          <h1 id="record-sheet-title">{title}</h1>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close record form">
            <X aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
        </div>
        <AddWeightForm
          key={formKey}
          mode={mode}
          initialValue={formValue}
          defaultDate={defaultDate}
          onSave={handleSave}
          onCancel={mode === "edit" && entry ? () => onCancelEdit(entry) : undefined}
          autoFocusWeight={mode !== "view"}
          selectWeightOnMount={mode !== "view"}
        />
        {entry && mode === "view" ? (
          <WeightRecordCard
            entry={entry}
            showSummary={false}
            className="record-card--footer"
            onEdit={() => onEdit(entry)}
            onDelete={() => onRequestDelete(entry)}
          />
        ) : null}
      </section>
    </div>
  );
}
