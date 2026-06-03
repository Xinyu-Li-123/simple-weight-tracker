import { useState } from "react";
import { PageHeaderRow } from "../../components/navigation/PageHeaderRow";
import { TopTabs } from "../../components/navigation/TopTabs";
import type { WeightEntry } from "../../types/weight";
import { DashboardTab } from "./home/DashboardTab";
import { HistoryTab } from "./home/HistoryTab";

type HomeTabId = "dashboard" | "history";

const homeTabs: Array<{ id: HomeTabId; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "history", label: "History" },
];

type Props = {
  entries: WeightEntry[];
  standalone: boolean;
  onOpenSidebar: () => void;
  onDelete: (id: string) => Promise<void>;
};

export function HomePage({ entries, standalone, onOpenSidebar, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<HomeTabId>("dashboard");

  return (
    <>
      <PageHeaderRow leftAction={{ kind: "menu", onClick: onOpenSidebar }}>
        <TopTabs tabs={homeTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </PageHeaderRow>
      {activeTab === "dashboard" ? (
        <DashboardTab entries={entries} standalone={standalone} onDelete={onDelete} />
      ) : (
        <HistoryTab />
      )}
    </>
  );
}
