import { ChangeEvent, useRef } from "react";
import { BlockTitle, List, ListButton } from "framework7-react";

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
    <>
      <BlockTitle>Backup and export</BlockTitle>
      <List strongIos dividersIos insetIos>
        <ListButton title="Export JSON backup" onClick={onExportJson} />
        <ListButton title="Export CSV" onClick={onExportCsv} />
        <ListButton title="Export Markdown" onClick={onExportMarkdown} />
        <ListButton title="Export TXT" onClick={onExportTxt} />
        <ListButton title="Import JSON backup" onClick={() => inputRef.current?.click()} />
      </List>
      <input ref={inputRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
    </>
  );
}
