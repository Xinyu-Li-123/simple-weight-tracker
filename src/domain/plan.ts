import type { WeightPlan } from "../types/plan";

export type WeightPhase = {
  index: number;
  fromKg: number;
  toKg: number;
  isFinalReached: boolean;
};

export function getPlanPoints(plan: WeightPlan): number[] {
  return [plan.startWeightKg, ...plan.milestonesKg]
    .map((value) => Math.round(value * 10) / 10)
    .sort((a, b) => b - a);
}

export function getCurrentPhase(input: { plan: WeightPlan; currentWeightKg: number }): WeightPhase {
  const { plan, currentWeightKg } = input;
  const points = getPlanPoints(plan);
  const finalTarget = points[points.length - 1];

  if (points.length === 1) {
    return {
      index: 0,
      fromKg: finalTarget,
      toKg: finalTarget,
      isFinalReached: currentWeightKg <= finalTarget,
    };
  }

  if (currentWeightKg <= finalTarget) {
    return {
      index: points.length - 2,
      fromKg: points[points.length - 2],
      toKg: finalTarget,
      isFinalReached: true,
    };
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const fromKg = points[index];
    const toKg = points[index + 1];

    if (currentWeightKg <= fromKg && currentWeightKg > toKg) {
      return {
        index,
        fromKg,
        toKg,
        isFinalReached: false,
      };
    }
  }

  return {
    index: 0,
    fromKg: points[0],
    toKg: points[1],
    isFinalReached: false,
  };
}
