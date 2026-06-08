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

export const activityLevelLabels: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  light: "Light activity",
  moderate: "Moderate activity",
  active: "High activity",
};

export const activityLevelDescriptions: Record<ActivityLevel, string> = {
  sedentary: "Mostly sitting, little planned activity.",
  light: "Some walking or light exercise.",
  moderate: "Regular walking or light exercise most weeks.",
  active: "Physical work or frequent structured exercise.",
};
