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
import { useToast } from "../toast/useToast";
import type { WeightEntry } from "../types/weight";
import type { PageId } from "./pages";

export function App() {
  const [page, setPage] = useState<PageId>("home");
  const [recordOpen, setRecordOpen] = useState(false);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [status, setStatus] = useState<StoragePersistenceStatus | null>(null);
  const standalone = isStandalonePWA();
  const { pushToast } = useToast();

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

  async function handleSave(input: { date: string; weight: number; note?: string }) {
    await upsertWeightEntry(input);
    setStatus(await requestPersistentStorage());
    await refresh();
    pushToast({ message: "Saved locally.", variant: "success" });
    setRecordOpen(false);
  }

  async function exportWith(kind: "json" | "csv" | "md" | "txt") {
    const current = await listWeightEntries();
    const date = new Date().toISOString().slice(0, 10);
    if (kind === "json") downloadTextFile(`weight-backup-${date}.json`, createJsonBackup(current), "application/json");
    if (kind === "csv") downloadTextFile(`weight-log-${date}.csv`, createCsv(current), "text/csv");
    if (kind === "md") downloadTextFile(`weight-log-${date}.md`, createMarkdown(current), "text/markdown");
    if (kind === "txt") downloadTextFile(`weight-log-${date}.txt`, createTxt(current), "text/plain");
    pushToast({ message: `Exported ${kind.toUpperCase()}.`, variant: "success" });
  }

  async function handleImport(text: string) {
    try {
      const count = await importJsonBackupText(text);
      await refresh();
      pushToast({ message: `Imported ${count} entries.`, variant: "success" });
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Import failed.";

      pushToast({ message, variant: "error" });
    }
  }

  async function handleRequestPersistentStorage() {
    setStatus(await requestPersistentStorage());
  }

  return (
    <>
      <main className="shell">
        {page === "home" ? (
          <HomePage
            entries={entries}
            standalone={standalone}
            onDelete={async (id) => { await deleteWeightEntry(id); await refresh(); }}
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
