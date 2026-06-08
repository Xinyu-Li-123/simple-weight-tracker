import type { WeightEntry } from "@/types/weight";

type Props = {
  entries: WeightEntry[];
  onOpenEntry: (entry: WeightEntry) => void;
};

export function CompactWeightList({ entries, onOpenEntry }: Props) {
  if (entries.length === 0) {
    return <p className="history-empty">No entries yet.</p>;
  }

  return (
    <ul className="compact-list">
      {entries.map((entry) => (
        <li key={entry.id}>
          <button type="button" className="compact-list__row" onClick={() => onOpenEntry(entry)}>
            <span className="compact-list__row-date">{entry.date}</span>
            <span className="compact-list__row-weight">{entry.weight} kg</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
