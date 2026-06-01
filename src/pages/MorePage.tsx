import { BackupPanel } from "../components/BackupPanel";
import { StorageStatusCard } from "../components/StorageStatusCard";
import type { StoragePersistenceStatus } from "../pwa/storagePersistence";

type ExportKind = "json" | "csv" | "md" | "txt";

type Props = {
  standalone: boolean;
  status: StoragePersistenceStatus | null;
  onRequestPersistentStorage: () => Promise<void>;
  onExport: (kind: ExportKind) => Promise<void>;
  onImportJson: (text: string) => Promise<void>;
};

export function MorePage({ standalone, status, onRequestPersistentStorage, onExport, onImportJson }: Props) {
  return (
    <>
      <header className="page-header">
        <h1>More</h1>
      </header>
      <StorageStatusCard standalone={standalone} status={status} onRequest={onRequestPersistentStorage} />
      <BackupPanel
        onExportJson={() => onExport("json")}
        onExportCsv={() => onExport("csv")}
        onExportMarkdown={() => onExport("md")}
        onExportTxt={() => onExport("txt")}
        onImportJson={onImportJson}
      />
    </>
  );
}
