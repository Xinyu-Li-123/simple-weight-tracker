import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  format,
} from "date-fns";
import { useTranslation } from "@/i18n";
import { getLanguageConfig } from "@/i18n/languages";
import type { WeightEntry } from "@/types/weight";

type Props = {
  entries: WeightEntry[];
  week: Date;
  onNavigate: (date: Date) => void;
  onOpenEntry: (entry: WeightEntry) => void;
  onCreateForDate: (date: string) => void;
};

function toDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function CalendarWeekView({ entries, week, onNavigate, onOpenEntry, onCreateForDate }: Props) {
  const { t, i18n } = useTranslation();
  const langConfig = getLanguageConfig(i18n.language);
  const locale = langConfig?.dateFnsLocale;
  const today = useMemo(() => new Date(), []);

  const entryByDate = useMemo(() => {
    const map = new Map<string, WeightEntry>();
    for (const entry of entries) {
      map.set(entry.date, entry);
    }
    return map;
  }, [entries]);

  const days = useMemo(() => {
    const weekStart = startOfWeek(week, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [week]);

  const weekLabel = useMemo(() => {
    const weekStart = days[0];
    const weekEnd = days[6];
    return `${format(weekStart, "MMM d", { locale })} – ${format(weekEnd, "MMM d, yyyy", { locale })}`;
  }, [days, locale]);

  return (
    <div className="calendar calendar-week">
      <div className="calendar-week__nav">
        <button
          type="button"
          className="calendar-week__nav-button"
          aria-label={t("calendar.prevWeek")}
          onClick={() => onNavigate(subWeeks(week, 1))}
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
        </button>
        <span className="calendar-week__nav-label">{weekLabel}</span>
        <button
          type="button"
          className="calendar-week__nav-button"
          aria-label={t("calendar.nextWeek")}
          onClick={() => onNavigate(addWeeks(week, 1))}
        >
          <ChevronRight size={16} strokeWidth={2.4} />
        </button>
        <button type="button" className="calendar-week__today-button" onClick={() => onNavigate(new Date())}>
          {t("calendar.today")}
        </button>
      </div>
      <div className="calendar-week__days">
        {days.map((day) => {
          const dateStr = toDateStr(day);
          const entry = entryByDate.get(dateStr);
          const isToday = isSameDay(day, today);

          const classes = [
            "calendar-week__day",
            isToday && "calendar-week__day--today",
            entry && "calendar-week__day--has-entry",
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
              className={classes}
              aria-label={t("calendar.cellAriaLabel", { date: dateStr, weight: weightText })}
              onClick={() => {
                if (entry) {
                  onOpenEntry(entry);
                } else {
                  onCreateForDate(dateStr);
                }
              }}
            >
              <span className="calendar-week__day-name">{format(day, "EEE", { locale })}</span>
              <span className="calendar-week__day-date">{format(day, "d", { locale })}</span>
              {entry ? (
                <span className="calendar-week__day-weight">{entry.weight} kg</span>
              ) : (
                <span className="calendar-week__day-empty">{t("calendar.noEntry")}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
