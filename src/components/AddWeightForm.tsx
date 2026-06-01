import { useState } from "react";
import { Block, BlockTitle, Button, List, ListInput } from "framework7-react";
import type { WeightUnit } from "../types/weight";

function today() {
  return new Date().toISOString().slice(0, 10);
}

type Props = {
  onSave: (input: { date: string; weight: number; unit: WeightUnit; note?: string }) => Promise<void>;
};

export function AddWeightForm({ onSave }: Props) {
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

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
    <form onSubmit={handleSubmit}>
      <BlockTitle>Add weight</BlockTitle>
      <List strongIos dividersIos insetIos>
        <ListInput label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
        <ListInput label="Weight" inputmode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="68.4" required />
        <ListInput label="Unit" type="select" value={unit} onChange={(event) => setUnit(event.target.value as WeightUnit)}>
          <option value="kg">kg</option>
          <option value="lb">lb</option>
        </ListInput>
        <ListInput label="Note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="optional" />
      </List>
      <Block inset>
        <Button fill large type="submit" disabled={busy}>{busy ? "Saving..." : "Save"}</Button>
      </Block>
    </form>
  );
}
