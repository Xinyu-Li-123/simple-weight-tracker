import type { WeightEntry } from "../types/weight";
import { WeightRecordCard } from "./WeightRecordCard";

type Props = {
  entries: WeightEntry[];
  onOpenEntry: (entry: WeightEntry) => void;
  onEditEntry: (entry: WeightEntry) => void;
  onDeleteEntry: (id: string) => Promise<void>;
  title?: string;
  emptyMessage?: string;
};

export function WeightList({
  entries,
  onOpenEntry,
  onEditEntry,
  onDeleteEntry,
  title = "History",
  emptyMessage = "No entries yet.",
}: Props) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {entries.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <WeightRecordCard
                entry={entry}
                onOpen={() => onOpenEntry(entry)}
                onEdit={() => onEditEntry(entry)}
                onDelete={() => void onDeleteEntry(entry.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
