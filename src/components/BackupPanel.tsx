import { ChangeEvent, useRef } from "react";
import { useTranslation } from "@/i18n";

type Props = {
  onExportJson: () => Promise<void>;
  onExportCsv: () => Promise<void>;
  onExportMarkdown: () => Promise<void>;
  onExportTxt: () => Promise<void>;
  onImportJson: (text: string) => Promise<void>;
};

export function BackupPanel({ onExportJson, onExportCsv, onExportMarkdown, onExportTxt, onImportJson }: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await onImportJson(await file.text());
    event.target.value = "";
  }

  return (
    <section className="card backup-actions">
      <h2>{t("backup.title")}</h2>
      <button onClick={onExportJson}>{t("backup.exportJson")}</button>
      <button className="secondary" onClick={onExportCsv}>{t("backup.exportCsv")}</button>
      <button className="secondary" onClick={onExportMarkdown}>{t("backup.exportMarkdown")}</button>
      <button className="secondary" onClick={onExportTxt}>{t("backup.exportTxt")}</button>
      <button className="ghost-danger backup-actions__import" onClick={() => inputRef.current?.click()}>
        {t("backup.import")}
      </button>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
    </section>
  );
}
