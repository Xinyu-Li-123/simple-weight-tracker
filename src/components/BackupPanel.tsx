import { ChangeEvent, useRef } from "react";

type Props = {
  onExportJson: () => Promise<void>;
  onExportCsv: () => Promise<void>;
  onExportMarkdown: () => Promise<void>;
  onExportTxt: () => Promise<void>;
  onImportJson: (text: string) => Promise<void>;
};

export function BackupPanel({ onExportJson, onExportCsv, onExportMarkdown, onExportTxt, onImportJson }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await onImportJson(await file.text());
    event.target.value = "";
  }

  return (
    <section className="card backup-actions">
      <h2>Backup and export</h2>
      <button onClick={onExportJson}>Export JSON backup</button>
      <button onClick={onExportCsv}>Export CSV</button>
      <button onClick={onExportMarkdown}>Export Markdown</button>
      <button onClick={onExportTxt}>Export TXT</button>
      <button className="ghost-danger backup-actions__import" onClick={() => inputRef.current?.click()}>
        Import and replace from JSON backup
      </button>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
    </section>
  );
}
