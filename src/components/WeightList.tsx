import type { WeightEntry } from "../types/weight";

type Props = {
  entries: WeightEntry[];
  onDelete: (id: string) => Promise<void>;
};

export function WeightList({ entries, onDelete }: Props) {
  return (
    <section className="card">
      <h2>History</h2>
      {entries.length === 0 ? (
        <p className="muted">No entries yet.</p>
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
