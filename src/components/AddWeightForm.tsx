import { useEffect, useRef, useState } from "react";
import { MAX_WEIGHT_ENTRY_NOTE_LENGTH } from "../db/weightEntryValidation";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export type WeightEntryDraft = {
  date: string;
  weight: number;
  note?: string;
};

export type WeightEntryFormMode = "create" | "edit" | "view";

type Props = {
  mode?: WeightEntryFormMode;
  initialValue?: Partial<WeightEntryDraft>;
  onSave?: (input: WeightEntryDraft) => Promise<void>;
  autoFocusWeight?: boolean;
  selectWeightOnMount?: boolean;
};

export function AddWeightForm({
  mode = "create",
  initialValue,
  onSave,
  autoFocusWeight = false,
  selectWeightOnMount = false,
}: Props) {
  const [date, setDate] = useState(initialValue?.date ?? today());
  const [weight, setWeight] = useState(initialValue?.weight?.toString() ?? "");
  const [note, setNote] = useState(initialValue?.note ?? "");
  const [busy, setBusy] = useState(false);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const isCreate = mode === "create";
  const isView = mode === "view";

  useEffect(() => {
    setDate(initialValue?.date ?? today());
    setWeight(initialValue?.weight?.toString() ?? "");
    setNote(initialValue?.note ?? "");
    setBusy(false);
  }, [initialValue?.date, initialValue?.note, initialValue?.weight, mode]);

  useEffect(() => {
    if (!autoFocusWeight || isView) return;
    const input = weightInputRef.current;
    if (!input) return;
    input.focus();
    if (selectWeightOnMount) input.select();
  }, [autoFocusWeight, isView, selectWeightOnMount]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!onSave || isView) return;
    const parsedWeight = Number(weight);
    if (!date || !Number.isFinite(parsedWeight) || parsedWeight <= 0) return;
    setBusy(true);
    try {
      await onSave({ date, weight: parsedWeight, note });
      if (isCreate) {
        setDate(today());
        setWeight("");
        setNote("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{isCreate ? "Add weight" : isView ? "Record details" : "Edit record"}</h2>
      <label className="form-field">
        Date
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          disabled={!isCreate}
        />
      </label>
      <label className={!isView ? "form-field" : "form-field form-field--readonly"}>
        Weight (kg)
        <input
          ref={weightInputRef}
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="68.4"
          required
          readOnly={isView}
          aria-readonly={isView}
        />
      </label>
      <label className={!isView ? "form-field" : "form-field form-field--readonly"}>
        Note
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="optional"
          maxLength={MAX_WEIGHT_ENTRY_NOTE_LENGTH}
          readOnly={isView}
          aria-readonly={isView}
        />
      </label>
      {!isView ? (
        <div className="form__actions">
          <button type="submit" disabled={busy}>{busy ? "Saving..." : isCreate ? "Save" : "Save changes"}</button>
        </div>
      ) : null}
    </form>
  );
}
