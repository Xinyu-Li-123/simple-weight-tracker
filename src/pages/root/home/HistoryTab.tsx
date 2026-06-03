import { WeightList } from "../../../components/WeightList";
import type { WeightEntry } from "../../../types/weight";

type Props = {
  entries: WeightEntry[];
  onOpenEntry: (entry: WeightEntry) => void;
  onEditEntry: (entry: WeightEntry) => void;
  onDeleteEntry: (id: string) => Promise<void>;
};

export function HistoryTab({ entries, onOpenEntry, onEditEntry, onDeleteEntry }: Props) {
  return <WeightList entries={entries} onOpenEntry={onOpenEntry} onEditEntry={onEditEntry} onDeleteEntry={onDeleteEntry} />;
}
