import type { WeightEntry } from "@/types/weight";

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

export type TrendRange = "10d" | "1m" | "3m" | "6m" | "1y" | "all";

export type TrendChartTick = {
  timestamp: number;
  label: string;
};

export type TrendChartData = {
  points: ChartPoint[];
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
  const descending = sortEntriesDescending(entries);
  const recent = descending.slice(0, 7);
  const previous = descending.slice(7, 14);
  const recentAvgKg = averageWeight(recent);
  const previousAvgKg = averageWeight(previous);
  const enoughData = recent.length >= 7 && previous.length >= 7;

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
  const usesWeeklyAverage = range === "6m" || range === "1y" || range === "all";
  const points = usesWeeklyAverage ? buildWeeklyAveragePoints(visibleEntries) : buildRawPoints(visibleEntries);

  return {
    points,
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

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([weekStart, bucket]) => ({
      date: bucket[bucket.length - 1]?.date ?? formatIsoDate(weekStart),
      weightKg: averageWeight(bucket) ?? bucket[bucket.length - 1]!.weight,
      movingAverageKg: null,
      timestamp: weekStart,
    }));
}

function buildTrendTicks(range: TrendRange, rangeStart: number, rangeEnd: number): TrendChartTick[] {
  if (rangeEnd <= rangeStart) {
    return [{ timestamp: rangeStart, label: formatTickLabel(rangeStart, range) }];
  }

  if (range === "10d" || range === "1m") {
    const desiredTicks: number = range === "10d" ? 3 : 4;
    return dedupeTicks(
      Array.from({ length: desiredTicks }, (_, index) => {
        const ratio = desiredTicks === 1 ? 0 : index / (desiredTicks - 1);
        const timestamp = startOfUtcDay(rangeStart + ratio * (rangeEnd - rangeStart));
        return { timestamp, label: formatTickLabel(timestamp, range) };
      }),
    );
  }

  const monthStep = getMonthTickStep(range, rangeStart, rangeEnd);
  const ticks: TrendChartTick[] = [];
  let cursor = startOfUtcMonth(rangeStart);
  if (cursor < rangeStart) {
    cursor = addUtcMonths(cursor, 1);
  }

  while (cursor <= rangeEnd) {
    ticks.push({
      timestamp: cursor,
      label: formatTickLabel(cursor, range),
    });
    cursor = addUtcMonths(cursor, monthStep);
  }

  return dedupeTicks([
    { timestamp: rangeStart, label: formatTickLabel(rangeStart, range) },
    ...ticks,
    { timestamp: rangeEnd, label: formatTickLabel(rangeEnd, range) },
  ]);
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

  const months = Math.max(1, diffUtcMonths(rangeStart, rangeEnd));
  return Math.max(1, Math.ceil(months / 5));
}

function formatTickLabel(timestamp: number, range: TrendRange): string {
  const date = new Date(timestamp);
  if (range === "10d" || range === "1m") {
    return `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
  }

  if (range === "3m" || range === "6m") {
    return date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  }

  return date.toLocaleString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
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

function diffUtcMonths(startTimestamp: number, endTimestamp: number): number {
  const start = new Date(startTimestamp);
  const end = new Date(endTimestamp);
  return (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + (end.getUTCMonth() - start.getUTCMonth());
}

function toUtcTimestamp(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatIsoDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}
