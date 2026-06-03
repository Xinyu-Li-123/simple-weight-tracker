import { WeightList } from "../../../components/WeightList";
import type { WeightEntry } from "../../../types/weight";

type Props = {
  entries: WeightEntry[];
  onDelete: (id: string) => Promise<void>;
};

export function HistoryTab({ entries, onDelete }: Props) {
  return <WeightList entries={entries} onDelete={onDelete} />;
}
