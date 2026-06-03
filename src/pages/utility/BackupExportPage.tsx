import { BackupPanel } from "../../components/BackupPanel";
import { PageHeaderRow } from "../../components/navigation/PageHeaderRow";

type ExportKind = "json" | "csv" | "md" | "txt";

type Props = {
  onBack: () => void;
  onExport: (kind: ExportKind) => Promise<void>;
  onImportJson: (text: string) => Promise<void>;
};

export function BackupExportPage({ onBack, onExport, onImportJson }: Props) {
  return (
    <>
      <PageHeaderRow leftAction={{ kind: "back", onClick: onBack }} />
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
