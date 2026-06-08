import type { ActivityLevel, Sex } from "@/types/plan";

export const conservativeActivityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.3,
  moderate: 1.4,
  active: 1.55,
};

export function calculateBmi(input: { weightKg: number; heightCm: number }): number {
  const heightM = input.heightCm / 100;
  return input.weightKg / (heightM * heightM);
}

export function calculateBmrMifflinStJeor(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
}): number {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return input.sex === "male" ? base + 5 : base - 161;
}

export function calculateConservativeTdee(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
}): {
  bmrKcal: number;
  tdeeKcal: number;
  multiplier: number;
} {
  const bmrKcal = calculateBmrMifflinStJeor(input);
  const multiplier = conservativeActivityMultipliers[input.activityLevel];
  const tdeeKcal = bmrKcal * multiplier;

  return {
    bmrKcal: Math.round(bmrKcal),
    tdeeKcal: Math.round(tdeeKcal),
    multiplier,
  };
}
