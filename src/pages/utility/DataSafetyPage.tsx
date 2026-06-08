import { StorageStatusCard } from "@/components/StorageStatusCard";
import { PageHeaderRow } from "@/components/navigation/PageHeaderRow";
import type { StoragePersistenceStatus } from "@/pwa/storagePersistence";

type Props = {
  standalone: boolean;
  status: StoragePersistenceStatus | null;
  onBack: () => void;
  onRequestPersistentStorage: () => Promise<void>;
};

export function DataSafetyPage({ standalone, status, onBack, onRequestPersistentStorage }: Props) {
  return (
    <>
      <PageHeaderRow leftAction={{ kind: "back", onClick: onBack }} />
      <StorageStatusCard standalone={standalone} status={status} onRequest={onRequestPersistentStorage} />
    </>
  );
}
