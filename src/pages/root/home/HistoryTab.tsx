import { useState } from "react";
import { useTranslation } from "@/i18n";
import { WeightList } from "@/components/WeightList";
import { HistoryViewSwitcher } from "@/pages/root/home/HistoryViewSwitcher";
import { CompactWeightList } from "@/pages/root/home/CompactWeightList";
import { CalendarMonthView } from "@/pages/root/home/CalendarMonthView";
import { CalendarWeekView } from "@/pages/root/home/CalendarWeekView";
import type { HistoryPreferences } from "@/preferences/types";
import type { WeightEntry } from "@/types/weight";

type Props = {
  entries: WeightEntry[];
  historyPreferences: HistoryPreferences;
  onChangeHistoryPreferences: (preferences: HistoryPreferences) => void;
  onOpenEntry: (entry: WeightEntry) => void;
  onEditEntry: (entry: WeightEntry) => void;
  onRequestDeleteEntry: (entry: WeightEntry) => void;
  onCreateForDate: (date: string) => void;
};

export function HistoryTab({
  entries,
  historyPreferences,
  onChangeHistoryPreferences,
  onOpenEntry,
  onEditEntry,
  onRequestDeleteEntry,
  onCreateForDate,
}: Props) {
  const { t } = useTranslation();
  const historyView = historyPreferences.historyView;
  const [month, setMonth] = useState(() => new Date());
  const [week, setWeek] = useState(() => new Date());

  function handleChangeView(view: HistoryPreferences["historyView"]) {
    onChangeHistoryPreferences({ historyView: view });
  }

  return (
    <section className="card">
      <div className="history-header-row">
        <h2>{t("history.title")}</h2>
        <HistoryViewSwitcher value={historyView} onChange={handleChangeView} />
      </div>
      {historyView === "list-compact" ? <CompactWeightList entries={entries} onOpenEntry={onOpenEntry} /> : null}
      {historyView === "list-expanded" ? (
        <WeightList entries={entries} onOpenEntry={onOpenEntry} onEditEntry={onEditEntry} onRequestDeleteEntry={onRequestDeleteEntry} />
      ) : null}
      {historyView === "calendar-month" ? (
        <CalendarMonthView
          entries={entries}
          month={month}
          onNavigate={setMonth}
          onOpenEntry={onOpenEntry}
          onCreateForDate={onCreateForDate}
        />
      ) : null}
      {historyView === "calendar-week" ? (
        <CalendarWeekView
          entries={entries}
          week={week}
          onNavigate={setWeek}
          onOpenEntry={onOpenEntry}
          onCreateForDate={onCreateForDate}
        />
      ) : null}
    </section>
  );
}
