import type { WeightPhase } from "./plan";
import type { WeeklyWeightStats } from "./weightStats";

export type TrendLabel = "continue_logging" | "continue" | "adjust" | "ease_up";

export type TrendResult = {
  label: TrendLabel;
  minLossKg: number | null;
  maxLossKg: number | null;
  weeklyLossKg: number | null;
  weeklyLossPct: number | null;
};

export const trendLabelText: Record<TrendLabel, string> = {
  continue_logging: "Continue logging",
  continue: "Continue",
  adjust: "Adjust",
  ease_up: "Ease up",
};

export const trendLabelDescription: Record<TrendLabel, string> = {
  continue_logging: "Log more weights before judging the trend.",
  continue: "Your current trend is within the plan range.",
  adjust: "Weight is not falling enough for this phase.",
  ease_up: "Weight is falling faster than the conservative range.",
};

export function getTrendResult(input: {
  stats: WeeklyWeightStats;
  phase: WeightPhase | null;
  totalPhases: number;
  referenceWeightKg: number | null;
}): TrendResult {
  const { stats, phase, totalPhases, referenceWeightKg } = input;

  if (
    !stats.enoughData ||
    stats.weeklyLossKg === null ||
    stats.weeklyLossPct === null ||
    referenceWeightKg === null ||
    phase === null
  ) {
    return {
      label: "continue_logging",
      minLossKg: null,
      maxLossKg: null,
      weeklyLossKg: stats.weeklyLossKg,
      weeklyLossPct: stats.weeklyLossPct,
    };
  }

  const phaseProgress = totalPhases <= 1 ? 0 : clamp(phase.index / (totalPhases - 1), 0, 1);
  const minLossPct = lerp(0.003, 0.0015, phaseProgress);
  const maxLossPct = lerp(0.012, 0.006, phaseProgress);
  const minLossKg = Math.max(0.2, referenceWeightKg * minLossPct);
  const maxLossKg = referenceWeightKg * maxLossPct;

  if (stats.weeklyLossKg < minLossKg) {
    return {
      label: "adjust",
      minLossKg,
      maxLossKg,
      weeklyLossKg: stats.weeklyLossKg,
      weeklyLossPct: stats.weeklyLossPct,
    };
  }

  if (stats.weeklyLossKg > maxLossKg) {
    return {
      label: "ease_up",
      minLossKg,
      maxLossKg,
      weeklyLossKg: stats.weeklyLossKg,
      weeklyLossPct: stats.weeklyLossPct,
    };
  }

  return {
    label: "continue",
    minLossKg,
    maxLossKg,
    weeklyLossKg: stats.weeklyLossKg,
    weeklyLossPct: stats.weeklyLossPct,
  };
}

function lerp(start: number, end: number, value: number): number {
  return start + (end - start) * value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
