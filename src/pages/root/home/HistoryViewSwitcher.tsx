import type { HistoryViewId } from "@/preferences/types";

const views: Array<{ id: HistoryViewId; label: string }> = [
  { id: "list-compact", label: "Cmpct" },
  { id: "list-expanded", label: "List" },
  { id: "calendar-week", label: "Week" },
  { id: "calendar-month", label: "Month" },
];

type Props = {
  value: HistoryViewId;
  onChange: (value: HistoryViewId) => void;
};

export function HistoryViewSwitcher({ value, onChange }: Props) {
  return (
    <div className="history-view-switcher" role="tablist" aria-label="History view">
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
