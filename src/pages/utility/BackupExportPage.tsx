import { BackupPanel } from "../../components/BackupPanel";
import { TopBar } from "../../components/navigation/TopBar";

type ExportKind = "json" | "csv" | "md" | "txt";

type Props = {
  onBack: () => void;
  onExport: (kind: ExportKind) => Promise<void>;
  onImportJson: (text: string) => Promise<void>;
};

export function BackupExportPage({ onBack, onExport, onImportJson }: Props) {
  return (
    <>
      <TopBar title="Backup and export" leftAction={{ kind: "back", onClick: onBack }} />
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
