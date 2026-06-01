import { useEffect, useState } from "react";
import { AddWeightForm } from "../components/AddWeightForm";
import { BackupPanel } from "../components/BackupPanel";
import { StorageStatusCard } from "../components/StorageStatusCard";
import { WeightList } from "../components/WeightList";
import { deleteWeightEntry, listWeightEntries, upsertWeightEntry } from "../db/weightEntries";
import { downloadTextFile } from "../export/downloadFile";
import { createCsv } from "../export/exportCsv";
import { createJsonBackup } from "../export/exportJson";
import { createMarkdown } from "../export/exportMarkdown";
import { createTxt } from "../export/exportTxt";
import { importJsonBackupText } from "../export/importJson";
import { isStandalonePWA } from "../pwa/displayMode";
import { getStoragePersistenceStatus, requestPersistentStorage, type StoragePersistenceStatus } from "../pwa/storagePersistence";
import type { WeightEntry, WeightUnit } from "../types/weight";

type Page = "home" | "more";

export function App() {
  const [page, setPage] = useState<Page>("home");
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

  async function handleSave(input: { date: string; weight: number; unit: WeightUnit; note?: string }) {
    await upsertWeightEntry(input);
    setStatus(await requestPersistentStorage());
    await refresh();
    setMessage("Saved locally.");
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
          <>
            {status && !status.persisted ? (
              <section className="warning storage-warning">
                <div>
                  <strong>Persistent storage is not active.</strong>
                  <p>Export JSON backups before changing device, deleting the app, or clearing website data.</p>
                </div>
                {status.supported ? <button type="button" onClick={handleRequestPersistentStorage}>Enable</button> : null}
              </section>
            ) : null}
            <AddWeightForm onSave={handleSave} />
            <WeightList entries={entries} onDelete={async (id) => { await deleteWeightEntry(id); await refresh(); }} />
          </>
        ) : (
          <>
            <header className="page-header">
              <h1>More</h1>
            </header>
            <StorageStatusCard standalone={standalone} status={status} onRequest={handleRequestPersistentStorage} />
            <BackupPanel
              onExportJson={() => exportWith("json")}
              onExportCsv={() => exportWith("csv")}
              onExportMarkdown={() => exportWith("md")}
              onExportTxt={() => exportWith("txt")}
              onImportJson={handleImport}
            />
          </>
        )}
      </main>
      <nav className="bottom-nav" aria-label="Primary navigation">
        <button type="button" className={page === "home" ? "active" : ""} aria-pressed={page === "home"} onClick={() => setPage("home")}>
          Home
        </button>
        <button type="button" className={page === "more" ? "active" : ""} aria-pressed={page === "more"} onClick={() => setPage("more")}>
          More
        </button>
      </nav>
    </>
  );
}
