import { useTranslation } from "@/i18n";
import type { HistoryViewId } from "@/preferences/types";

type Props = {
  value: HistoryViewId;
  onChange: (value: HistoryViewId) => void;
};

export function HistoryViewSwitcher({ value, onChange }: Props) {
  const { t } = useTranslation();

  const views: Array<{ id: HistoryViewId; label: string }> = [
    { id: "list-compact", label: t("history.viewCmpct") },
    { id: "list-expanded", label: t("history.viewList") },
    { id: "calendar-week", label: t("history.viewWeek") },
    { id: "calendar-month", label: t("history.viewMonth") },
  ];

  return (
    <div className="history-view-switcher" role="tablist" aria-label={t("history.viewAriaLabel")}>
      {views.map((view) => (
        <button
          key={view.id}
          type="button"
          className={
            value === view.id
              ? "history-view-switcher__button history-view-switcher__button--active"
              : "history-view-switcher__button"
          }
          aria-pressed={value === view.id}
          onClick={() => onChange(view.id)}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
