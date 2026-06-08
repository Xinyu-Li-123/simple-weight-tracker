import { useEffect, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { RecordSheet } from "@/components/RecordSheet";
import type { WeightEntryDraft, WeightEntryFormMode } from "@/components/AddWeightForm";
import { SidebarDrawer } from "@/components/navigation/SidebarDrawer";
import { deleteWeightEntry, listWeightEntries, upsertWeightEntry } from "@/db/weightEntries";
import { deleteWeightPlan, getWeightPlan, saveWeightPlan } from "@/db/weightPlan";
import { downloadTextFile } from "@/export/downloadFile";
import { createCsv } from "@/export/exportCsv";
import { createJsonBackup } from "@/export/exportJson";
import { createMarkdown } from "@/export/exportMarkdown";
import { createTxt } from "@/export/exportTxt";
import { importJsonBackupText } from "@/export/importJson";
import { HomePage } from "@/pages/root/HomePage";
import { PlanPage } from "@/pages/root/PlanPage";
import { BackupExportPage } from "@/pages/utility/BackupExportPage";
import { DataSafetyPage } from "@/pages/utility/DataSafetyPage";
import { SettingsPage } from "@/pages/utility/SettingsPage";
import { loadAppPreferences, saveAppPreferences } from "@/preferences/appStorage";
import { getLocalDateForTimezonePreference } from "@/preferences/timezone";
import type { AppPreferences, DashboardPreferences, TimezonePreference } from "@/preferences/types";
import { isStandalonePWA } from "@/pwa/displayMode";
import { getStoragePersistenceStatus, requestPersistentStorage, type StoragePersistenceStatus } from "@/pwa/storagePersistence";
import { useToast } from "@/toast/useToast";
import type { WeightPlan, WeightPlanInput } from "@/types/plan";
import type { WeightEntry } from "@/types/weight";
import { sidebarItems, type RootPageId, type UtilityPageId } from "@/app/pages";

type RecordSheetState =
  | { mode: "create"; entry: null }
  | { mode: Exclude<WeightEntryFormMode, "create">; entry: WeightEntry };

type ConfirmationRequest = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  onConfirm: () => Promise<boolean>;
};

export function App() {
  const [rootPage, setRootPage] = useState<RootPageId>("home");
  const [utilityPage, setUtilityPage] = useState<UtilityPageId | null>(null);
  const [recordSheetState, setRecordSheetState] = useState<RecordSheetState | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationRequest | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [plan, setPlan] = useState<WeightPlan | null>(null);
  const [status, setStatus] = useState<StoragePersistenceStatus | null>(null);
  const [appPreferences, setAppPreferences] = useState<AppPreferences>(() => loadAppPreferences());
  const standalone = isStandalonePWA();
  const { pushToast } = useToast();
  const recordOpen = recordSheetState !== null;
  const confirmOpen = confirmation !== null;
  const dashboardPreferences = appPreferences.dashboard;
  const defaultDate = getLocalDateForTimezonePreference(appPreferences.timezone);

  function closeConfirmation() {
    setConfirmation(null);
  }

  async function refresh() {
    const [nextEntries, nextPlan, nextStatus] = await Promise.all([listWeightEntries(), getWeightPlan(), getStoragePersistenceStatus()]);
    setEntries(nextEntries);
    setPlan(nextPlan);
    setStatus(nextStatus);
  }

  useEffect(() => {
    void Promise.all([listWeightEntries(), getWeightPlan(), getStoragePersistenceStatus()]).then(([nextEntries, nextPlan, nextStatus]) => {
      setEntries(nextEntries);
      setPlan(nextPlan);
      setStatus(nextStatus);
    });
  }, []);

  useEffect(() => {
    saveAppPreferences(appPreferences);
  }, [appPreferences]);

  useEffect(() => {
    if (!recordOpen && !confirmOpen && !sidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (sidebarOpen) {
          setSidebarOpen(false);
          return;
        }

        if (confirmOpen && !confirmBusy) {
          closeConfirmation();
          return;
        }

        if (recordOpen) {
          setRecordSheetState(null);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [confirmBusy, confirmOpen, recordOpen, sidebarOpen]);

  async function handleCreate(input: WeightEntryDraft) {
    try {
      await upsertWeightEntry(input);
      setStatus(await requestPersistentStorage());
      await refresh();
      pushToast({ message: "Saved locally.", variant: "success" });
      setRecordSheetState(null);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Could not save entry.";

      pushToast({ message, variant: "error" });
    }
  }

  async function handleUpdate(input: WeightEntryDraft) {
    try {
      await upsertWeightEntry(input);
      setStatus(await requestPersistentStorage());
      await refresh();
      pushToast({ message: "Record updated.", variant: "success" });
      setRecordSheetState(null);
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Could not update record.";

      pushToast({ message, variant: "error" });
    }
  }

  async function handleDeleteEntry(id: string): Promise<boolean> {
    try {
      await deleteWeightEntry(id);
      await refresh();
      pushToast({ message: "Record deleted.", variant: "success" });
      setRecordSheetState((current) => (current?.entry?.id === id ? null : current));
      return true;
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Could not delete record.";

      pushToast({ message, variant: "error" });
      return false;
    }
  }

  async function exportWith(kind: "json" | "csv" | "md" | "txt") {
    const [current, currentPlan] = await Promise.all([listWeightEntries(), getWeightPlan()]);
    const date = getLocalDateForTimezonePreference(appPreferences.timezone);
    if (kind === "json") downloadTextFile(`weight-backup-${date}.json`, createJsonBackup(current, currentPlan), "application/json");
    if (kind === "csv") downloadTextFile(`weight-log-${date}.csv`, createCsv(current), "text/csv");
    if (kind === "md") downloadTextFile(`weight-log-${date}.md`, createMarkdown(current), "text/markdown");
    if (kind === "txt") downloadTextFile(`weight-log-${date}.txt`, createTxt(current), "text/plain");
    pushToast({ message: `Exported ${kind.toUpperCase()}.`, variant: "success" });
  }

  async function handleImport(text: string) {
    setConfirmation({
      title: "Import backup and replace current data?",
      description: "This will permanently replace your current history and plan with the contents of the selected backup.",
      confirmLabel: "Import and replace",
      tone: "danger",
      onConfirm: () => handleConfirmImport(text),
    });
  }

  async function handleConfirmImport(text: string): Promise<boolean> {
    try {
      const result = await importJsonBackupText(text);
      await refresh();
      pushToast({
        message: `Restored ${result.entriesCount} entries${result.importedPlan ? " and plan" : ""}.`,
        variant: "success",
      });
      return true;
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Import failed.";

      pushToast({ message, variant: "error" });
      return false;
    }
  }


  async function handleSavePlan(input: WeightPlanInput) {
    await saveWeightPlan(input);
    await refresh();
    pushToast({ message: "Plan saved.", variant: "success" });
  }

  async function handleDeletePlan(): Promise<boolean> {
    try {
      await deleteWeightPlan();
      await refresh();
      pushToast({ message: "Plan deleted.", variant: "success" });
      return true;
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : "Could not delete plan.";

      pushToast({ message, variant: "error" });
      return false;
    }
  }

  async function handleRequestPersistentStorage() {
    setStatus(await requestPersistentStorage());
  }

  function handleChangeDashboardPreferences(preferences: DashboardPreferences) {
    setAppPreferences((current) => ({
      ...current,
      dashboard: preferences,
    }));
  }

  function handleChangeTimezonePreference(preference: TimezonePreference) {
    setAppPreferences((current) => ({
      ...current,
      timezone: preference,
    }));
  }

  function handleNavigate(page: RootPageId) {
    setRootPage(page);
    setUtilityPage(null);
  }

  function handleOpenUtilityPage(page: UtilityPageId) {
    setSidebarOpen(false);
    setUtilityPage(page);
  }

  function requestDeleteEntry(entry: WeightEntry) {
    setConfirmation({
      title: "Delete record?",
      description: `Delete the record for ${entry.date} at ${entry.weight} kg? This cannot be undone.`,
      confirmLabel: "Delete record",
      tone: "danger",
      onConfirm: () => handleDeleteEntry(entry.id),
    });
  }

  function requestDeletePlan() {
    setConfirmation({
      title: "Delete plan?",
      description: "Delete your current weight plan and milestones? This cannot be undone.",
      confirmLabel: "Delete plan",
      tone: "danger",
      onConfirm: handleDeletePlan,
    });
  }

  async function handleConfirmAction() {
    if (!confirmation) return;
    setConfirmBusy(true);
    try {
      const success = await confirmation.onConfirm();
      if (success) {
        closeConfirmation();
      }
    } finally {
      setConfirmBusy(false);
    }
  }

  return (
    <>
      <main className="shell">
        {utilityPage === null && rootPage === "home" ? (
          <HomePage
            entries={entries}
            plan={plan}
            standalone={standalone}
            dashboardPreferences={dashboardPreferences}
            onChangeDashboardPreferences={handleChangeDashboardPreferences}
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenPlan={() => handleNavigate("plan")}
            onOpenEntry={(entry) => setRecordSheetState({ mode: "view", entry })}
            onEditEntry={(entry) => setRecordSheetState({ mode: "edit", entry })}
            onRequestDeleteEntry={requestDeleteEntry}
          />
        ) : null}
        {utilityPage === null && rootPage === "plan" ? (
          <PlanPage
            plan={plan}
            onOpenSidebar={() => setSidebarOpen(true)}
            onSavePlan={handleSavePlan}
            onRequestDeletePlan={requestDeletePlan}
          />
        ) : null}
        {utilityPage === "data-safety" ? (
          <DataSafetyPage
            standalone={standalone}
            status={status}
            onBack={() => setUtilityPage(null)}
            onRequestPersistentStorage={handleRequestPersistentStorage}
          />
        ) : null}
        {utilityPage === "settings" ? (
          <SettingsPage
            timezonePreference={appPreferences.timezone}
            onBack={() => setUtilityPage(null)}
            onChangeTimezonePreference={handleChangeTimezonePreference}
          />
        ) : null}
        {utilityPage === "backup-export" ? (
          <BackupExportPage
            onBack={() => setUtilityPage(null)}
            onExport={exportWith}
            onImportJson={handleImport}
          />
        ) : null}
      </main>
      <SidebarDrawer
        open={sidebarOpen}
        items={sidebarItems}
        onClose={() => setSidebarOpen(false)}
        onSelect={handleOpenUtilityPage}
      />
      {utilityPage === null ? (
        <BottomNav activePage={rootPage} onNavigate={handleNavigate} onRecord={() => setRecordSheetState({ mode: "create", entry: null })} />
      ) : null}
      <RecordSheet
        open={recordOpen}
        mode={recordSheetState?.mode ?? "create"}
        entry={recordSheetState?.entry ?? null}
        onClose={() => setRecordSheetState(null)}
        onCancelEdit={(entry) => setRecordSheetState({ mode: "view", entry })}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onRequestDelete={requestDeleteEntry}
        onEdit={(entry) => setRecordSheetState({ mode: "edit", entry })}
        defaultDate={defaultDate}
      />
      <ConfirmDialog
        open={confirmOpen}
        title={confirmation?.title ?? ""}
        description={confirmation?.description ?? ""}
        confirmLabel={confirmation?.confirmLabel ?? "Confirm"}
        cancelLabel={confirmation?.cancelLabel}
        tone={confirmation?.tone}
        busy={confirmBusy}
        onCancel={() => {
          if (!confirmBusy) closeConfirmation();
        }}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}
