import { useEffect, useState } from "react";
import { App as Framework7App, Link, Navbar, Page, Tab, Tabs, Toolbar, ToolbarPane, View, f7ready } from "framework7-react";
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

type PageId = "home" | "more";

export function App() {
  const [page, setPage] = useState<PageId>("home");
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [status, setStatus] = useState<StoragePersistenceStatus | null>(null);
  const standalone = isStandalonePWA();

  function showMessage(text: string) {
    f7ready((app) => {
      app.toast.create({ text, closeTimeout: 2000 }).open();
    });
  }

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
    showMessage("Saved locally.");
  }

  async function exportWith(kind: "json" | "csv" | "md" | "txt") {
    const current = await listWeightEntries();
    const date = new Date().toISOString().slice(0, 10);
    if (kind === "json") downloadTextFile(`weight-backup-${date}.json`, createJsonBackup(current), "application/json");
    if (kind === "csv") downloadTextFile(`weight-log-${date}.csv`, createCsv(current), "text/csv");
    if (kind === "md") downloadTextFile(`weight-log-${date}.md`, createMarkdown(current), "text/markdown");
    if (kind === "txt") downloadTextFile(`weight-log-${date}.txt`, createTxt(current), "text/plain");
    showMessage(`Exported ${kind.toUpperCase()}.`);
  }

  async function handleImport(text: string) {
    const count = await importJsonBackupText(text);
    await refresh();
    showMessage(`Imported ${count} entries.`);
  }

  async function handleRequestPersistentStorage() {
    setStatus(await requestPersistentStorage());
  }

  return (
    <Framework7App name="Simple Weight Tracker" theme="auto">
      <View main>
        <Page pageContent={false}>
          <Navbar title={page === "home" ? "Weight" : "More"} />
          <Toolbar tabbar icons bottom>
            <ToolbarPane>
              <Link
                tabLink="#home"
                tabLinkActive
                text="Home"
                iconIos="f7:house_fill"
                iconMd="material:home"
                onClick={() => setPage("home")}
              />
              <Link
                tabLink="#more"
                text="More"
                iconIos="f7:ellipsis_circle_fill"
                iconMd="material:more_horiz"
                onClick={() => setPage("more")}
              />
            </ToolbarPane>
          </Toolbar>
          <Tabs>
            <Tab id="home" className="page-content" tabActive>
              {page === "home" ? (
                <HomePage
                  entries={entries}
                  status={status}
                  onSave={handleSave}
                  onDelete={async (id) => { await deleteWeightEntry(id); await refresh(); }}
                  onRequestPersistentStorage={handleRequestPersistentStorage}
                />
              ) : null}
            </Tab>
            <Tab id="more" className="page-content">
              {page === "more" ? (
                <MorePage
                  standalone={standalone}
                  status={status}
                  onRequestPersistentStorage={handleRequestPersistentStorage}
                  onExport={exportWith}
                  onImportJson={handleImport}
                />
              ) : null}
            </Tab>
          </Tabs>
        </Page>
      </View>
    </Framework7App>
  );
}
