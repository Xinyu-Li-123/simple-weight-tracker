import { useState } from "react";
import { PageHeaderRow } from "../../components/navigation/PageHeaderRow";
import { TopTabs } from "../../components/navigation/TopTabs";
import type { WeightPlan } from "../../types/plan";
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
  plan: WeightPlan | null;
  standalone: boolean;
  onOpenSidebar: () => void;
  onOpenPlan: () => void;
  onDelete: (id: string) => Promise<void>;
};

export function HomePage({ entries, plan, standalone, onOpenSidebar, onOpenPlan, onDelete }: Props) {
  const [activeTab, setActiveTab] = useState<HomeTabId>("dashboard");

  return (
    <>
      <PageHeaderRow leftAction={{ kind: "menu", onClick: onOpenSidebar }}>
        <TopTabs tabs={homeTabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </PageHeaderRow>
      {activeTab === "dashboard" ? (
        <DashboardTab entries={entries} plan={plan} standalone={standalone} onOpenPlan={onOpenPlan} />
      ) : (
        <HistoryTab entries={entries} onDelete={onDelete} />
      )}
    </>
  );
}
