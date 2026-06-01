import { WeightList } from "../components/WeightList";
import type { StoragePersistenceStatus } from "../pwa/storagePersistence";
import type { WeightEntry } from "../types/weight";

type Props = {
  entries: WeightEntry[];
  status: StoragePersistenceStatus | null;
  onDelete: (id: string) => Promise<void>;
  onRequestPersistentStorage: () => Promise<void>;
};

export function HomePage({ entries, status, onDelete, onRequestPersistentStorage }: Props) {
  return (
    <>
      {status && !status.persisted ? (
        <section className="warning storage-warning">
          <div>
            <strong>Persistent storage is not active.</strong>
            <p>Export JSON backups before changing device, deleting the app, or clearing website data.</p>
          </div>
          {status.supported ? <button type="button" onClick={onRequestPersistentStorage}>Enable</button> : null}
        </section>
      ) : null}
      <section className="card summary-placeholder">
        <h2>Summary</h2>
        <p className="muted">Visualization placeholder. A chart or trend summary will live here in a later slice.</p>
      </section>
      <WeightList entries={entries} onDelete={onDelete} />
    </>
  );
}
