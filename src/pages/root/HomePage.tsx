import { homeTabs, type HomeTabId } from "../../app/pages";
import { TopBar } from "../../components/navigation/TopBar";
import type { WeightEntry } from "../../types/weight";
import { DashboardTab } from "./home/DashboardTab";
import { HistoryTab } from "./home/HistoryTab";

type Props = {
  activeTab: HomeTabId;
  entries: WeightEntry[];
  standalone: boolean;
  onOpenSidebar: () => void;
  onTabChange: (tab: HomeTabId) => void;
  onDelete: (id: string) => Promise<void>;
};

export function HomePage({ activeTab, entries, standalone, onOpenSidebar, onTabChange, onDelete }: Props) {
  return (
    <>
      <TopBar
        leftAction={{ kind: "menu", onClick: onOpenSidebar }}
        tabs={homeTabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      {activeTab === "dashboard" ? (
        <DashboardTab entries={entries} standalone={standalone} onDelete={onDelete} />
      ) : (
        <HistoryTab />
      )}
    </>
  );
}
