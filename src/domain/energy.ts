import type { ActivityLevel, Sex } from "@/types/plan";

export const conservativeActivityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.3,
  moderate: 1.4,
  active: 1.55,
};

export type BmiCategory = "underweight" | "normal" | "overweight" | "obese_1" | "obese_2" | "obese_3";

export type BmiCategoryInfo = {
  category: BmiCategory;
  label: string;
};

const BMI_CATEGORIES: { max: number; info: BmiCategoryInfo }[] = [
  { max: 18.5, info: { category: "underweight", label: "Underweight" } },
  { max: 25, info: { category: "normal", label: "Normal range" } },
  { max: 30, info: { category: "overweight", label: "Overweight (Pre-obese)" } },
  { max: 35, info: { category: "obese_1", label: "Obese (Class I)" } },
  { max: 40, info: { category: "obese_2", label: "Obese (Class II)" } },
  { max: Infinity, info: { category: "obese_3", label: "Obese (Class III)" } },
];

export function getBmiCategory(bmi: number): BmiCategoryInfo {
  for (const { max, info } of BMI_CATEGORIES) {
    if (bmi < max) return info;
  }
  return BMI_CATEGORIES[BMI_CATEGORIES.length - 1].info;
}

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
