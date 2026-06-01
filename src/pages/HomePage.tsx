import { WeightList } from "../components/WeightList";
import type { StoragePersistenceStatus } from "../pwa/storagePersistence";
import { useToast } from "../toast/useToast";
import type { WeightEntry } from "../types/weight";

type Props = {
  entries: WeightEntry[];
  status: StoragePersistenceStatus | null;
  onDelete: (id: string) => Promise<void>;
  onRequestPersistentStorage: () => Promise<void>;
};

export function HomePage({ entries, status, onDelete, onRequestPersistentStorage }: Props) {
  const { pushToast } = useToast();

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
      <section className="card testing-panel">
        <h2>Testing</h2>
        <section className="testing-panel__section" aria-labelledby="testing-toast-types">
          <h3 id="testing-toast-types">Toast Types</h3>
          <div className="testing-panel__actions">
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Informational toast", variant: "info" })}>
              Info
            </button>
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Success toast", variant: "success" })}>
              Success
            </button>
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Warning toast", variant: "warning" })}>
              Warning
            </button>
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Error toast", variant: "error" })}>
              Error
            </button>
          </div>
        </section>
      </section>
    </>
  );
}
