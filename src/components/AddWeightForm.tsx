import { useRef, useState, useEffect } from "react";
import { useTranslation } from "@/i18n";
import { MAX_WEIGHT_ENTRY_NOTE_LENGTH } from "@/db/weightEntryValidation";

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
  onCancel?: () => void;
  autoFocusWeight?: boolean;
  selectWeightOnMount?: boolean;
  defaultDate: string;
};

export function AddWeightForm({
  mode = "create",
  initialValue,
  onSave,
  onCancel,
  autoFocusWeight = false,
  selectWeightOnMount = false,
  defaultDate,
}: Props) {
  const { t } = useTranslation();
  const [date, setDate] = useState(initialValue?.date ?? defaultDate);
  const [weight, setWeight] = useState(initialValue?.weight?.toString() ?? "");
  const [note, setNote] = useState(initialValue?.note ?? "");
  const [busy, setBusy] = useState(false);
  const weightInputRef = useRef<HTMLInputElement>(null);
  const isCreate = mode === "create";
  const isView = mode === "view";

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
        setDate(defaultDate);
        setWeight("");
        setNote("");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" style={{ backgroundColor: 'rgba(0,0,0,0)' }} onSubmit={handleSubmit}>
      <label className="form-field">
        {t("record.date")}
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          disabled={!isCreate}
        />
      </label>
      <label className={!isView ? "form-field" : "form-field form-field--readonly"}>
        {t("record.weight")}
        <input
          ref={weightInputRef}
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder={t("record.weightPlaceholder")}
          required
          readOnly={isView}
          aria-readonly={isView}
        />
      </label>
      <label className={!isView ? "form-field" : "form-field form-field--readonly"}>
        {t("record.note")}
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t("record.notePlaceholder")}
          maxLength={MAX_WEIGHT_ENTRY_NOTE_LENGTH}
          readOnly={isView}
          aria-readonly={isView}
        />
      </label>
      {!isView ? (
        <div className="form__actions">
          <button type="submit" disabled={busy}>{busy ? t("common.saving") : t("common.save")}</button>
          {!isCreate && onCancel ? (
            <button type="button" className="secondary" onClick={onCancel} disabled={busy}>{t("common.cancel")}</button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
