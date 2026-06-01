import { useEffect, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { RecordSheet } from "../components/RecordSheet";
import { deleteWeightEntry, listWeightEntries, upsertWeightEntry } from "../db/weightEntries";
import { downloadTextFile } from "../export/downloadFile";
import { createCsv } from "../export/exportCsv";
import { createJsonBackup } from "../export/exportJson";
import { createMarkdown } from "../export/exportMarkdown";
import { createTxt } from "../export/exportTxt";
import { importJsonBackupText } from "../export/importJson";
import { HomePage } from "../pages/HomePage";
import { MorePage } from "../pages/MorePage";
import { isStandalonePWA } from "../pwa/displayMode";
import { getStoragePersistenceStatus, requestPersistentStorage, type StoragePersistenceStatus } from "../pwa/storagePersistence";
import type { WeightEntry, WeightUnit } from "../types/weight";
import type { PageId } from "./pages";

export function App() {
  const [page, setPage] = useState<PageId>("home");
  const [recordOpen, setRecordOpen] = useState(false);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [status, setStatus] = useState<StoragePersistenceStatus | null>(null);
  const [message, setMessage] = useState<string>("");
  const standalone = isStandalonePWA();

  async function refresh() {
    const [nextEntries, nextStatus] = await Promise.all([listWeightEntries(), getStoragePersistenceStatus()]);
    setEntries(nextEntries);
    setStatus(nextStatus);
  }

  useEffect(() => {
    void Promise.all([listWeightEntries(), getStoragePersistenceStatus()]).then(([nextEntries, nextStatus]) => {
      setEntries(nextEntries);
      setStatus(nextStatus);
    });
  }, []);

  useEffect(() => {
    if (!recordOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setRecordOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [recordOpen]);

  async function handleSave(input: { date: string; weight: number; unit: WeightUnit; note?: string }) {
    await upsertWeightEntry(input);
    setStatus(await requestPersistentStorage());
    await refresh();
    setMessage("Saved locally.");
    setRecordOpen(false);
  }

  async function exportWith(kind: "json" | "csv" | "md" | "txt") {
    const current = await listWeightEntries();
    const date = new Date().toISOString().slice(0, 10);
    if (kind === "json") downloadTextFile(`weight-backup-${date}.json`, createJsonBackup(current), "application/json");
    if (kind === "csv") downloadTextFile(`weight-log-${date}.csv`, createCsv(current), "text/csv");
    if (kind === "md") downloadTextFile(`weight-log-${date}.md`, createMarkdown(current), "text/markdown");
    if (kind === "txt") downloadTextFile(`weight-log-${date}.txt`, createTxt(current), "text/plain");
    setMessage(`Exported ${kind.toUpperCase()}.`);
  }

  async function handleImport(text: string) {
    const count = await importJsonBackupText(text);
    await refresh();
    setMessage(`Imported ${count} entries.`);
  }

  async function handleRequestPersistentStorage() {
    setStatus(await requestPersistentStorage());
  }

  return (
    <>
      <main className="shell">
        {message ? <p className="notice">{message}</p> : null}

        {page === "home" ? (
          <HomePage
            entries={entries}
            status={status}
            onDelete={async (id) => { await deleteWeightEntry(id); await refresh(); }}
            onRequestPersistentStorage={handleRequestPersistentStorage}
          />
        ) : (
          <MorePage
            standalone={standalone}
            status={status}
            onRequestPersistentStorage={handleRequestPersistentStorage}
            onExport={exportWith}
            onImportJson={handleImport}
          />
        )}
      </main>
      <BottomNav activePage={page} onNavigate={setPage} onRecord={() => setRecordOpen(true)} />
      <RecordSheet open={recordOpen} onClose={() => setRecordOpen(false)} onSave={handleSave} />
    </>
  );
}
