import { StorageStatusCard } from "../../components/StorageStatusCard";
import { TopBar } from "../../components/navigation/TopBar";
import type { StoragePersistenceStatus } from "../../pwa/storagePersistence";

type Props = {
  standalone: boolean;
  status: StoragePersistenceStatus | null;
  onBack: () => void;
  onRequestPersistentStorage: () => Promise<void>;
};

export function DataSafetyPage({ standalone, status, onBack, onRequestPersistentStorage }: Props) {
  return (
    <>
      <TopBar title="Data Safety" leftAction={{ kind: "back", onClick: onBack }} />
      <StorageStatusCard standalone={standalone} status={status} onRequest={onRequestPersistentStorage} />
    </>
  );
}
