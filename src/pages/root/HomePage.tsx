import { useState } from "react";
import { PageHeaderRow } from "@/components/navigation/PageHeaderRow";
import { TopTabs } from "@/components/navigation/TopTabs";
import type { DashboardPreferences, HistoryPreferences } from "@/preferences/types";
import type { WeightPlan } from "@/types/plan";
import type { WeightEntry } from "@/types/weight";
import { DashboardTab } from "@/pages/root/home/DashboardTab";
import { HistoryTab } from "@/pages/root/home/HistoryTab";

type HomeTabId = "dashboard" | "history";

const homeTabs: Array<{ id: HomeTabId; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "history", label: "History" },
];

type Props = {
  entries: WeightEntry[];
  plan: WeightPlan | null;
  standalone: boolean;
  dashboardPreferences: DashboardPreferences;
  historyPreferences: HistoryPreferences;
  onChangeDashboardPreferences: (preferences: DashboardPreferences) => void;
  onChangeHistoryPreferences: (preferences: HistoryPreferences) => void;
  onOpenSidebar: () => void;
  onOpenPlan: () => void;
  onOpenEntry: (entry: WeightEntry) => void;
  onEditEntry: (entry: WeightEntry) => void;
  onRequestDeleteEntry: (entry: WeightEntry) => void;
  onCreateForDate: (date: string) => void;
};

export function HomePage({
  entries,
  plan,
  standalone,
  dashboardPreferences,
  historyPreferences,
  onChangeDashboardPreferences,
  onChangeHistoryPreferences,
  onOpenSidebar,
  onOpenPlan,
  onOpenEntry,
  onEditEntry,
  onRequestDeleteEntry,
  onCreateForDate,
}: Props) {
  const [activeTab, setActiveTab] = useState<HomeTabId>("dashboard");

  return (
    <>
      <PageHeaderRow leftAction={{ kind: "menu", onClick: onOpenSidebar }}>
        <TopTabs tabs={homeTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </PageHeaderRow>
      {activeTab === "dashboard" ? (
        <DashboardTab
          entries={entries}
          plan={plan}
          standalone={standalone}
          preferences={dashboardPreferences}
          onChangePreferences={onChangeDashboardPreferences}
          onOpenPlan={onOpenPlan}
        />
      ) : (
        <HistoryTab
          entries={entries}
          historyPreferences={historyPreferences}
          onChangeHistoryPreferences={onChangeHistoryPreferences}
          onOpenEntry={onOpenEntry}
          onEditEntry={onEditEntry}
          onRequestDeleteEntry={onRequestDeleteEntry}
          onCreateForDate={onCreateForDate}
        />
      )}
    </>
  );
}
