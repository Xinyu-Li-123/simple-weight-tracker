import { useMemo } from "react"; import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  format,
} from "date-fns";
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
    return `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
  }, [days]);

  return (
    <div className="calendar calendar-week">
      <div className="calendar-week__nav">
        <button
          type="button"
          className="calendar-week__nav-button"
          aria-label="Previous week"
          onClick={() => onNavigate(subWeeks(week, 1))}
        >
          <ChevronLeft size={16} strokeWidth={2.4} />
        </button>
        <span className="calendar-week__nav-label">{weekLabel}</span>
        <button
          type="button"
          className="calendar-week__nav-button"
          aria-label="Next week"
          onClick={() => onNavigate(addWeeks(week, 1))}
        >
          <ChevronRight size={16} strokeWidth={2.4} />
        </button>
        <button type="button" className="calendar-week__today-button" onClick={() => onNavigate(new Date())}>
          Today
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

          return (
            <button
              key={dateStr}
              type="button"
              className={classes}
              aria-label={`${dateStr}${entry ? `, ${entry.weight} kg` : ", no entry"}`}
              onClick={() => {
                if (entry) {
                  onOpenEntry(entry);
                } else {
                  onCreateForDate(dateStr);
                }
              }}
            >
              <span className="calendar-week__day-name">{format(day, "EEE")}</span>
              <span className="calendar-week__day-date">{format(day, "d")}</span>
              {entry ? (
                <span className="calendar-week__day-weight">{entry.weight} kg</span>
              ) : (
                <span className="calendar-week__day-empty">—</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
