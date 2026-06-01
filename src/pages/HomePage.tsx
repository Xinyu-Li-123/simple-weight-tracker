import { AddWeightForm } from "../components/AddWeightForm";
import { WeightList } from "../components/WeightList";
import type { StoragePersistenceStatus } from "../pwa/storagePersistence";
import type { WeightEntry, WeightUnit } from "../types/weight";

type Props = {
  entries: WeightEntry[];
  status: StoragePersistenceStatus | null;
  onSave: (input: { date: string; weight: number; unit: WeightUnit; note?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onRequestPersistentStorage: () => Promise<void>;
};

export function HomePage({ entries, status, onSave, onDelete, onRequestPersistentStorage }: Props) {
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
      <AddWeightForm onSave={onSave} />
      <WeightList entries={entries} onDelete={onDelete} />
    </>
  );
}
