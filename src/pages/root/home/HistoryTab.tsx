import { WeightList } from "../../../components/WeightList";
import type { WeightEntry } from "../../../types/weight";

type Props = {
  entries: WeightEntry[];
  onOpenEntry: (entry: WeightEntry) => void;
  onEditEntry: (entry: WeightEntry) => void;
  onRequestDeleteEntry: (entry: WeightEntry) => void;
};

export function HistoryTab({ entries, onOpenEntry, onEditEntry, onRequestDeleteEntry }: Props) {
  return <WeightList entries={entries} onOpenEntry={onOpenEntry} onEditEntry={onEditEntry} onRequestDeleteEntry={onRequestDeleteEntry} />;
}
