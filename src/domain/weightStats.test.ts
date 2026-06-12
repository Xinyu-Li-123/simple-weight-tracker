import { describe, expect, it } from "vitest";
import { getWeeklyWeightStats } from "@/domain/weightStats";
import type { WeightEntry } from "@/types/weight";

function makeEntry(date: string, weight: number): WeightEntry {
  return {
    id: date,
    date,
    weight,
    createdAt: `${date}T00:00:00.000Z`,
    updatedAt: `${date}T00:00:00.000Z`,
  };
}

describe("getWeeklyWeightStats", () => {
  it("compares the latest logged calendar week against the previous calendar week", () => {
    const stats = getWeeklyWeightStats([
      makeEntry("2026-06-01", 81),
      makeEntry("2026-06-04", 79),
      makeEntry("2026-06-09", 78),
      makeEntry("2026-06-12", 76),
    ]);

    expect(stats.enoughData).toBe(true);
    expect(stats.recentAvgKg).toBe(77);
    expect(stats.previousAvgKg).toBe(80);
    expect(stats.weeklyChangeKg).toBe(-3);
    expect(stats.weeklyLossKg).toBe(3);
    expect(stats.weeklyLossPct).toBeCloseTo(3 / 77);
    expect(stats.recentEntriesCount).toBe(2);
    expect(stats.previousEntriesCount).toBe(2);
  });

  it("treats sparse adjacent weeks as valid calendar-week averages", () => {
    const stats = getWeeklyWeightStats([
      makeEntry("2026-06-03", 82),
      makeEntry("2026-06-10", 80),
      makeEntry("2026-06-11", 79),
    ]);

    expect(stats.enoughData).toBe(true);
    expect(stats.recentAvgKg).toBe(79.5);
    expect(stats.previousAvgKg).toBe(82);
    expect(stats.recentEntriesCount).toBe(2);
    expect(stats.previousEntriesCount).toBe(1);
  });

  it("returns insufficient data when only one calendar week has entries", () => {
    const stats = getWeeklyWeightStats([
      makeEntry("2026-06-09", 78),
      makeEntry("2026-06-12", 76),
    ]);

    expect(stats.enoughData).toBe(false);
    expect(stats.recentAvgKg).toBe(77);
    expect(stats.previousAvgKg).toBeNull();
    expect(stats.weeklyChangeKg).toBeNull();
    expect(stats.weeklyLossKg).toBeNull();
    expect(stats.weeklyLossPct).toBeNull();
    expect(stats.recentEntriesCount).toBe(2);
    expect(stats.previousEntriesCount).toBe(0);
  });

  it("returns insufficient data when the previous calendar week is empty", () => {
    const stats = getWeeklyWeightStats([
      makeEntry("2026-05-26", 84),
      makeEntry("2026-06-09", 78),
      makeEntry("2026-06-12", 76),
    ]);

    expect(stats.enoughData).toBe(false);
    expect(stats.recentAvgKg).toBe(77);
    expect(stats.previousAvgKg).toBeNull();
    expect(stats.weeklyChangeKg).toBeNull();
    expect(stats.weeklyLossKg).toBeNull();
    expect(stats.weeklyLossPct).toBeNull();
    expect(stats.recentEntriesCount).toBe(2);
    expect(stats.previousEntriesCount).toBe(0);
  });

  it("uses Monday as the calendar-week boundary", () => {
    const stats = getWeeklyWeightStats([
      makeEntry("2026-06-07", 81),
      makeEntry("2026-06-08", 80),
      makeEntry("2026-06-14", 79),
    ]);

    expect(stats.enoughData).toBe(true);
    expect(stats.recentAvgKg).toBe(79.5);
    expect(stats.previousAvgKg).toBe(81);
    expect(stats.weeklyLossKg).toBe(1.5);
    expect(stats.recentEntriesCount).toBe(2);
    expect(stats.previousEntriesCount).toBe(1);
  });
});
