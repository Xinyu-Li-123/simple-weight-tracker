import { X } from "lucide-react";
import { AddWeightForm } from "./AddWeightForm";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (input: { date: string; weight: number; note?: string }) => Promise<void>;
};

export function RecordSheet({ open, onClose, onSave }: Props) {
  if (!open) return null;

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
          <h1 id="record-sheet-title">Record</h1>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close record form">
            <X aria-hidden="true" size={18} strokeWidth={2.4} />
          </button>
        </div>
        <AddWeightForm onSave={onSave} autoFocusWeight selectWeightOnMount />
      </section>
    </div>
  );
}
