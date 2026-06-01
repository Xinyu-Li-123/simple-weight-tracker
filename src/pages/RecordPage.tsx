import { AddWeightForm } from "../components/AddWeightForm";
import type { WeightUnit } from "../types/weight";

type Props = {
  onSave: (input: { date: string; weight: number; unit: WeightUnit; note?: string }) => Promise<void>;
};

export function RecordPage({ onSave }: Props) {
  return (
    <>
      <header className="page-header">
        <h1>Record</h1>
      </header>
      <AddWeightForm onSave={onSave} />
    </>
  );
}
