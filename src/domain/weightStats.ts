import type { WeightEntry } from "@/types/weight";
import { i18n } from "@/i18n";
import { getLanguageConfig } from "@/i18n/languages";

const DAY_MS = 24 * 60 * 60 * 1000;

export type WeeklyWeightStats = {
  enoughData: boolean;
  recentAvgKg: number | null;
  previousAvgKg: number | null;
  weeklyChangeKg: number | null;
  weeklyLossKg: number | null;
  weeklyLossPct: number | null;
  recentEntriesCount: number;
  previousEntriesCount: number;
};

export type ChartPoint = {
  date: string;
  weightKg: number;
  movingAverageKg: number | null;
  timestamp: number;
};

export type TrendWeeklyBlock = {
  startTimestamp: number;
  endTimestamp: number;
  valueKg: number;
};

export type TrendRange = "10d" | "1m" | "3m" | "6m" | "1y" | "all";

export type TrendChartTick = {
  timestamp: number;
  label: string;
  kind?: "day" | "month" | "quarter" | "year" | "year_separator";
};

export type TrendChartData = {
  points: ChartPoint[];
  weeklyBlocks: TrendWeeklyBlock[];
  ticks: TrendChartTick[];
  rangeStart: number;
  rangeEnd: number;
  usesWeeklyAverage: boolean;
};

export function sortEntriesAscending(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) => a.date.localeCompare(b.date));
}

export function sortEntriesDescending(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date));
}

export function getLatestEntry(entries: WeightEntry[]): WeightEntry | null {
  return sortEntriesDescending(entries)[0] ?? null;
}

export function averageWeight(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null;
  return entries.reduce((total, entry) => total + entry.weight, 0) / entries.length;
}

export function getWeeklyWeightStats(entries: WeightEntry[]): WeeklyWeightStats {
  const ascending = sortEntriesAscending(entries);
  const latestEntry = ascending[ascending.length - 1];

  if (!latestEntry) {
    return {
      enoughData: false,
      recentAvgKg: null,
      previousAvgKg: null,
      weeklyChangeKg: null,
      weeklyLossKg: null,
      weeklyLossPct: null,
      recentEntriesCount: 0,
      previousEntriesCount: 0,
    };
  }

  const buckets = bucketEntriesByWeek(ascending);
  const recentWeekStart = startOfUtcWeek(toUtcTimestamp(latestEntry.date));
  const previousWeekStart = recentWeekStart - 7 * DAY_MS;
  const recent = buckets.get(recentWeekStart) ?? [];
  const previous = buckets.get(previousWeekStart) ?? [];
  const recentAvgKg = averageWeight(recent);
  const previousAvgKg = averageWeight(previous);
  const enoughData = recent.length >= 1 && previous.length >= 1;

  if (!enoughData || recentAvgKg === null || previousAvgKg === null) {
    return {
      enoughData: false,
      recentAvgKg,
      previousAvgKg,
      weeklyChangeKg: null,
      weeklyLossKg: null,
      weeklyLossPct: null,
      recentEntriesCount: recent.length,
      previousEntriesCount: previous.length,
    };
  }

  const weeklyChangeKg = recentAvgKg - previousAvgKg;
  const weeklyLossKg = previousAvgKg - recentAvgKg;
  const weeklyLossPct = weeklyLossKg / recentAvgKg;

  return {
    enoughData: true,
    recentAvgKg,
    previousAvgKg,
    weeklyChangeKg,
    weeklyLossKg,
    weeklyLossPct,
    recentEntriesCount: recent.length,
    previousEntriesCount: previous.length,
  };
}

function bucketEntriesByWeek(entries: WeightEntry[]): Map<number, WeightEntry[]> {
  const buckets = new Map<number, WeightEntry[]>();

  for (const entry of entries) {
    const weekStart = startOfUtcWeek(toUtcTimestamp(entry.date));
    const bucket = buckets.get(weekStart);
    if (bucket) {
      bucket.push(entry);
    } else {
      buckets.set(weekStart, [entry]);
    }
  }

  return buckets;
}

export function getChartPoints(entries: WeightEntry[], limit = 30): ChartPoint[] {
  const ascending = sortEntriesAscending(entries).slice(-limit);

  return ascending.map((entry, index) => {
    const window = ascending.slice(Math.max(0, index - 6), index + 1);
    const movingAverageKg = window.length >= 2 ? averageWeight(window) : null;

    return {
      date: entry.date,
      weightKg: entry.weight,
      movingAverageKg,
      timestamp: toUtcTimestamp(entry.date),
    };
  });
}

export function getTrendChartData(entries: WeightEntry[], range: TrendRange): TrendChartData {
  const ascending = sortEntriesAscending(entries);
  if (ascending.length === 0) {
    const today = startOfUtcDay(Date.now());
    return {
      points: [],
      weeklyBlocks: [],
      ticks: [],
      rangeStart: today,
      rangeEnd: today,
      usesWeeklyAverage: false,
    };
  }

  const latestTimestamp = toUtcTimestamp(ascending[ascending.length - 1].date);
  const firstTimestamp = toUtcTimestamp(ascending[0].date);
  const rangeStart = range === "all" ? firstTimestamp : latestTimestamp - (getRangeDays(range) - 1) * DAY_MS;
  const rangeEnd = latestTimestamp;
  const visibleEntries = ascending.filter((entry) => {
    const timestamp = toUtcTimestamp(entry.date);
    return timestamp >= rangeStart && timestamp <= rangeEnd;
  });
  const usesWeeklyAverage = range === "3m" || range === "6m" || range === "1y" || range === "all";
  const points = usesWeeklyAverage ? buildWeeklyAveragePoints(visibleEntries) : buildRawPoints(visibleEntries);
  const weeklyBlocks = usesWeeklyAverage ? [] : buildWeeklyAverageBlocks(visibleEntries, rangeStart, rangeEnd);

  return {
    points,
    weeklyBlocks,
    ticks: buildTrendTicks(range, rangeStart, rangeEnd),
    rangeStart,
    rangeEnd,
    usesWeeklyAverage,
  };
}

function buildRawPoints(entries: WeightEntry[]): ChartPoint[] {
  return entries.map((entry, index) => {
    const window = entries.slice(Math.max(0, index - 6), index + 1);
    const movingAverageKg = window.length >= 2 ? averageWeight(window) : null;

    return {
      date: entry.date,
      weightKg: entry.weight,
      movingAverageKg,
      timestamp: toUtcTimestamp(entry.date),
    };
  });
}

function buildWeeklyAveragePoints(entries: WeightEntry[]): ChartPoint[] {
  return Array.from(bucketEntriesByWeek(entries).entries())
    .sort((a, b) => a[0] - b[0])
    .map(([weekStart, bucket]) => ({
      date: bucket[bucket.length - 1]?.date ?? formatIsoDate(weekStart),
      weightKg: averageWeight(bucket) ?? bucket[bucket.length - 1]!.weight,
      movingAverageKg: null,
      timestamp: weekStart,
    }));
}

function buildWeeklyAverageBlocks(entries: WeightEntry[], rangeStart: number, rangeEnd: number): TrendWeeklyBlock[] {
  if (entries.length === 0) return [];

  return Array.from(bucketEntriesByWeek(entries).entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([weekStart, bucket]) => {
      const averageKg = averageWeight(bucket);
      if (averageKg === null) return [];

      const weekEnd = weekStart + 6 * DAY_MS;
      const blockStart = Math.max(rangeStart, weekStart);
      const blockEnd = Math.min(rangeEnd + DAY_MS, weekEnd + DAY_MS);

      return [{
        startTimestamp: blockStart,
        endTimestamp: blockEnd,
        valueKg: averageKg,
      }];
    });
}

function buildTrendTicks(range: TrendRange, rangeStart: number, rangeEnd: number): TrendChartTick[] {
  if (rangeEnd <= rangeStart) {
    return [{ timestamp: rangeStart, label: formatMonth(rangeStart) }];
  }

  if (range === "10d" || range === "1m") {
    const desiredTicks: number = range === "10d" ? 3 : 4;
    return dedupeTicks(
      Array.from({ length: desiredTicks }, (_, index) => {
        const ratio = desiredTicks === 1 ? 0 : index / (desiredTicks - 1);
        const timestamp = startOfUtcDay(rangeStart + ratio * (rangeEnd - rangeStart));
        return { timestamp, label: formatShortDate(timestamp) };
      }),
    );
  }

  const spanDays = (rangeEnd - rangeStart) / DAY_MS;
  const monthStep = getMonthTickStep(range, rangeStart, rangeEnd);
  const ticks: TrendChartTick[] = [];

  let cursor: number;
  if (range === "all" && spanDays >= 365 && spanDays < 365 * 3) {
    cursor = startOfUtcQuarter(rangeStart);
  } else if (range === "all" && spanDays >= 365 * 3) {
    cursor = startOfUtcYear(rangeStart);
  } else {
    cursor = startOfUtcMonth(rangeStart);
  }

  while (cursor <= rangeEnd) {
    ticks.push({ timestamp: cursor, label: "" });
    cursor = addUtcMonths(cursor, monthStep);
  }

  applyTickLabels(ticks, range, spanDays);
  insertYearSeparators(ticks);

  return ticks;
}

function applyTickLabels(ticks: TrendChartTick[], range: TrendRange, spanDays: number): void {
  if (range === "10d" || range === "1m") {
    for (const tick of ticks) {
      tick.label = formatShortDate(tick.timestamp);
      tick.kind = "day";
    }
    return;
  }

  if (range === "3m" || range === "6m" || range === "1y") {
    for (const tick of ticks) {
      tick.label = formatMonth(tick.timestamp);
      tick.kind = "month";
    }
    return;
  }

  // range === "all"
  if (spanDays < 365) {
    for (const tick of ticks) {
      tick.label = formatMonth(tick.timestamp);
      tick.kind = "month";
    }
  } else if (spanDays < 365 * 3) {
    for (const tick of ticks) {
      tick.label = formatQuarter(tick.timestamp);
      tick.kind = "quarter";
    }
  } else {
    for (const tick of ticks) {
      tick.label = String(new Date(tick.timestamp).getUTCFullYear());
      tick.kind = "year";
    }
  }
}

function insertYearSeparators(ticks: TrendChartTick[]): void {
  for (let i = ticks.length - 2; i >= 0; i -= 1) {
    const prev = ticks[i];
    const next = ticks[i + 1];
    const prevKind = prev.kind;
    const nextKind = next.kind;
    if (
      !prevKind || !nextKind ||
      (prevKind !== "month" && prevKind !== "quarter") ||
      (nextKind !== "month" && nextKind !== "quarter")
    ) continue;

    const prevYear = new Date(prev.timestamp).getUTCFullYear();
    const nextYear = new Date(next.timestamp).getUTCFullYear();
    if (prevYear === nextYear) continue;

    ticks.splice(i + 1, 0, {
      timestamp: Math.round((prev.timestamp + next.timestamp) / 2),
      label: String(nextYear),
      kind: "year_separator",
    });
  }
}

function dedupeTicks(ticks: TrendChartTick[]): TrendChartTick[] {
  return ticks
    .sort((a, b) => a.timestamp - b.timestamp)
    .filter((tick, index, all) => index === 0 || tick.timestamp !== all[index - 1]?.timestamp);
}

function getRangeDays(range: Exclude<TrendRange, "all">): number {
  if (range === "10d") return 10;
  if (range === "1m") return 30;
  if (range === "3m") return 90;
  if (range === "6m") return 180;
  return 365;
}

function getMonthTickStep(range: TrendRange, rangeStart: number, rangeEnd: number): number {
  if (range === "3m") return 1;
  if (range === "6m") return 1;
  if (range === "1y") return 2;

  const spanDays = (rangeEnd - rangeStart) / DAY_MS;
  if (spanDays < 365) return 1;
  if (spanDays < 365 * 3) return 3;
  return 12;
}

function formatMonth(timestamp: number): string {
  const langConfig = getLanguageConfig(i18n.language);
  const localeTag = langConfig?.intlLocale ?? langConfig?.code ?? "en";
  return new Date(timestamp).toLocaleString(localeTag, { month: "short", timeZone: "UTC" });
}

function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
}

function startOfUtcDay(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function startOfUtcWeek(timestamp: number): number {
  const date = new Date(startOfUtcDay(timestamp));
  const day = date.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diffToMonday);
}

function startOfUtcMonth(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function addUtcMonths(timestamp: number, months: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1);
}

function startOfUtcQuarter(timestamp: number): number {
  const date = new Date(timestamp);
  return Date.UTC(date.getUTCFullYear(), Math.floor(date.getUTCMonth() / 3) * 3, 1);
}

function startOfUtcYear(timestamp: number): number {
  return Date.UTC(new Date(timestamp).getUTCFullYear(), 0, 1);
}

function formatQuarter(timestamp: number): string {
  return `Q${Math.floor(new Date(timestamp).getUTCMonth() / 3) + 1}`;
}

function toUtcTimestamp(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}
