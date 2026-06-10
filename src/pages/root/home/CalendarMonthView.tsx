import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { useTranslation } from "@/i18n";
import { getLanguageConfig } from "@/i18n/languages";
import type { WeightEntry } from "@/types/weight";

type Props = {
  entries: WeightEntry[];
  month: Date;
  onNavigate: (date: Date) => void;
  onOpenEntry: (entry: WeightEntry) => void;
  onCreateForDate: (date: string) => void;
};

function toDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function CalendarMonthView({ entries, month, onNavigate, onOpenEntry, onCreateForDate }: Props) {
  const { t, i18n } = useTranslation();
  const langConfig = getLanguageConfig(i18n.language);
  const locale = langConfig?.dateFnsLocale;
  const today = useMemo(() => new Date(), []);

  const dayHeaders = [
    t("calendar.mon"), t("calendar.tue"), t("calendar.wed"),
    t("calendar.thu"), t("calendar.fri"), t("calendar.sat"), t("calendar.sun"),
  ];

  const entryByDate = useMemo(() => {
    const map = new Map<string, WeightEntry>();
    for (const entry of entries) {
      map.set(entry.date, entry);
    }
    return map;
  }, [entries]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [month]);

  return (
    <div className="calendar calendar-month">
      <div className="calendar-month__nav">
        <button
          type="button"
          className="calendar-month__nav-button"
          aria-label={t("calendar.prevMonth")}
          onClick={() => onNavigate(subMonths(month, 1))}
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
        </button>
        <span className="calendar-month__nav-label">{format(month, "MMMM yyyy", { locale })}</span>
        <button
          type="button"
          className="calendar-month__nav-button"
          aria-label={t("calendar.nextMonth")}
          onClick={() => onNavigate(addMonths(month, 1))}
        >
          <ChevronRight size={16} strokeWidth={2.4} />
        </button>
        <button type="button" className="calendar-month__today-button" onClick={() => onNavigate(new Date())}>
          {t("calendar.today")}
        </button>
      </div>
      <div className="calendar-month__grid">
        {dayHeaders.map((day) => (
          <div key={day} className="calendar-month__day-header">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const dateStr = toDateStr(day);
          const entry = entryByDate.get(dateStr);
          const outside = !isSameMonth(day, month);
          const isToday = isSameDay(day, today);

          const cellClasses = [
            "calendar-month__cell",
            outside && "calendar-month__cell--outside",
            isToday && "calendar-month__cell--today",
            entry && "calendar-month__cell--has-entry",
          ]
            .filter(Boolean)
            .join(" ");

          const weightText = entry
            ? t("calendar.cellAriaWeight", { weight: entry.weight })
            : "";

          return (
            <button
              key={dateStr}
              type="button"
              className={cellClasses}
              disabled={outside}
              aria-label={t("calendar.cellAriaLabel", { date: dateStr, weight: weightText })}
              onClick={() => {
                if (entry) {
                  onOpenEntry(entry);
                } else if (!outside) {
                  onCreateForDate(dateStr);
                }
              }}
            >
              <span className="calendar-month__cell-date">{format(day, "d", { locale })}</span>
              {entry ? <span className="calendar-month__cell-weight">{entry.weight}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
