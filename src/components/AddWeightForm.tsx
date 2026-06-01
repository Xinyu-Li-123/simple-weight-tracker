import { useEffect, useRef, useState } from "react";
import type { WeightUnit } from "../types/weight";

function today() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  onSave: (input: { date: string; weight: number; unit: WeightUnit; note?: string }) => Promise<void>;
  autoFocusWeight?: boolean;
  selectWeightOnMount?: boolean;
};

export function AddWeightForm({ onSave, autoFocusWeight = false, selectWeightOnMount = false }: Props) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const weightInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!autoFocusWeight) return;
    const input = weightInputRef.current;
    if (!input) return;
    input.focus();
    if (selectWeightOnMount) input.select();
  }, [autoFocusWeight, selectWeightOnMount]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsedWeight = Number(weight);
    if (!date || !Number.isFinite(parsedWeight) || parsedWeight <= 0) return;
    setBusy(true);
    try {
      await onSave({ date, weight: parsedWeight, unit, note });
      setWeight("");
      setNote("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>Add weight</h2>
      <label>
        Date
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
      </label>
      <label>
        Weight
        <input
          ref={weightInputRef}
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="68.4"
          required
        />
      </label>
      <label>
        Unit
        <select value={unit} onChange={(event) => setUnit(event.target.value as WeightUnit)}>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </select>
      </label>
      <label>
        Note
        <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="optional" />
      </label>
      <button type="submit" disabled={busy}>{busy ? "Saving..." : "Save"}</button>
    </form>
  );
}
