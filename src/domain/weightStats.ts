import type { WeightEntry } from "../types/weight";

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
    };
  });
}
