import type { WeightEntry } from "../types/weight";

type Props = {
  entries: WeightEntry[];
  onDelete: (id: string) => Promise<void>;
  title?: string;
  emptyMessage?: string;
};

export function WeightList({ entries, onDelete, title = "History", emptyMessage = "No entries yet." }: Props) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {entries.length === 0 ? (
        <p className="muted">{emptyMessage}</p>
      ) : (
        <ul className="entry-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <div>
                <strong>{entry.date}</strong>
                <span>{entry.weight} kg</span>
                {entry.note ? <small>{entry.note}</small> : null}
              </div>
              <button className="ghost" onClick={() => onDelete(entry.id)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
