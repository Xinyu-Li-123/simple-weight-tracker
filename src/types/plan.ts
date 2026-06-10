import { i18n } from "@/i18n";

export type Sex = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

export type WeightPlan = {
  id: "default";
  startWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  sex: Sex;
  age: number;
  activityLevel: ActivityLevel;
  milestonesKg: number[];
  createdAt: string;
  updatedAt: string;
};

export type WeightPlanInput = {
  startWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  sex: Sex;
  age: number;
  activityLevel: ActivityLevel;
  milestonesKg?: number[];
};

export function getActivityLevelLabel(level: ActivityLevel): string {
  return i18n.t(`plan.activity_${level}`);
}

export function getActivityLevelDescription(level: ActivityLevel): string {
  return i18n.t(`plan.activity_${level}Desc`);
}
