import { calculateBmi, calculateConservativeTdee } from "@/domain/energy";
import { getCurrentPhase, getPlanPoints } from "@/domain/plan";
import { getTrendResult, type TrendResult } from "@/domain/trend";
import { getLatestEntry, getWeeklyWeightStats } from "@/domain/weightStats";
import type { WeightPlan } from "@/types/plan";
import type { WeightEntry } from "@/types/weight";

export type PlanSummary = {
  hasPlan: boolean;
  latestWeightKg: number | null;
  currentPhase: {
    fromKg: number;
    toKg: number;
    completedKg: number;
    totalKg: number;
    progressPct: number;
    isFinalReached: boolean;
  } | null;
  weekly: {
    enoughData: boolean;
    recentAvgKg: number | null;
    previousAvgKg: number | null;
    weeklyLossKg: number | null;
    recentEntriesCount: number;
    previousEntriesCount: number;
  };
  trend: TrendResult;
  metrics: {
    totalLossKg: number | null;
    remainingLossKg: number | null;
    bmi: number | null;
    bmrKcal: number | null;
    tdeeKcal: number | null;
    activityMultiplier: number | null;
  };
};

export function getPlanSummary(input: { entries: WeightEntry[]; plan: WeightPlan | null }): PlanSummary {
  const { entries, plan } = input;
  const latestEntry = getLatestEntry(entries);
  const latestWeightKg = latestEntry?.weight ?? null;
  const stats = getWeeklyWeightStats(entries);
  const baseTrend: TrendResult = {
    label: "continue_logging",
    minLossKg: null,
    maxLossKg: null,
    weeklyLossKg: stats.weeklyLossKg,
    weeklyLossPct: stats.weeklyLossPct,
  };

  if (!plan || latestWeightKg === null) {
    return {
      hasPlan: Boolean(plan),
      latestWeightKg,
      currentPhase: null,
      weekly: {
        enoughData: stats.enoughData,
        recentAvgKg: stats.recentAvgKg,
        previousAvgKg: stats.previousAvgKg,
        weeklyLossKg: stats.weeklyLossKg,
        recentEntriesCount: stats.recentEntriesCount,
        previousEntriesCount: stats.previousEntriesCount,
      },
      trend: baseTrend,
      metrics: {
        totalLossKg: plan && latestWeightKg !== null ? Math.max(0, plan.startWeightKg - latestWeightKg) : null,
        remainingLossKg: plan && latestWeightKg !== null ? Math.max(0, latestWeightKg - plan.targetWeightKg) : null,
        bmi: plan && latestWeightKg !== null ? calculateBmi({ weightKg: latestWeightKg, heightCm: plan.heightCm }) : null,
        bmrKcal: null,
        tdeeKcal: null,
        activityMultiplier: null,
      },
    };
  }

  const phase = getCurrentPhase({ plan, currentWeightKg: latestWeightKg });
  const points = getPlanPoints(plan);
  const totalPhases = Math.max(1, points.length - 1);
  const trend = getTrendResult({
    stats,
    phase,
    totalPhases,
    referenceWeightKg: stats.recentAvgKg ?? latestWeightKg,
  });
  const tdee = calculateConservativeTdee({
    sex: plan.sex,
    age: plan.age,
    heightCm: plan.heightCm,
    weightKg: latestWeightKg,
    activityLevel: plan.activityLevel,
  });
  const phaseTotalKg = Math.max(0, phase.fromKg - phase.toKg);
  const phaseCompletedKg = clamp(phase.fromKg - latestWeightKg, 0, phaseTotalKg);

  return {
    hasPlan: true,
    latestWeightKg,
    currentPhase: {
      fromKg: phase.fromKg,
      toKg: phase.toKg,
      completedKg: phaseCompletedKg,
      totalKg: phaseTotalKg,
      progressPct: phaseTotalKg === 0 ? 1 : phaseCompletedKg / phaseTotalKg,
      isFinalReached: phase.isFinalReached,
    },
    weekly: {
      enoughData: stats.enoughData,
      recentAvgKg: stats.recentAvgKg,
      previousAvgKg: stats.previousAvgKg,
      weeklyLossKg: stats.weeklyLossKg,
      recentEntriesCount: stats.recentEntriesCount,
      previousEntriesCount: stats.previousEntriesCount,
    },
    trend,
    metrics: {
      totalLossKg: Math.max(0, plan.startWeightKg - latestWeightKg),
      remainingLossKg: Math.max(0, latestWeightKg - plan.targetWeightKg),
      bmi: calculateBmi({ weightKg: latestWeightKg, heightCm: plan.heightCm }),
      bmrKcal: tdee.bmrKcal,
      tdeeKcal: tdee.tdeeKcal,
      activityMultiplier: tdee.multiplier,
    },
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
