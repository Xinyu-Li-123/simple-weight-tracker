import { db } from "@/db/db";
import { generateMilestones, normalizeMilestones } from "@/domain/milestones";
import type { WeightPlan, WeightPlanInput } from "@/types/plan";

export async function getWeightPlan(): Promise<WeightPlan | null> {
  return (await db.weightPlans.get("default")) ?? null;
}

export async function saveWeightPlan(input: WeightPlanInput): Promise<WeightPlan> {
  validateWeightPlanInput(input);

  const now = new Date().toISOString();
  const existing = await getWeightPlan();
  const milestonesKg = input.milestonesKg
    ? normalizeMilestones({
        startWeightKg: input.startWeightKg,
        targetWeightKg: input.targetWeightKg,
        milestonesKg: input.milestonesKg,
      })
    : generateMilestones({
        startWeightKg: input.startWeightKg,
        targetWeightKg: input.targetWeightKg,
        heightCm: input.heightCm,
      });

  const plan: WeightPlan = {
    id: "default",
    startWeightKg: roundOne(input.startWeightKg),
    targetWeightKg: roundOne(input.targetWeightKg),
    heightCm: Math.round(input.heightCm),
    sex: input.sex,
    age: Math.round(input.age),
    activityLevel: input.activityLevel,
    milestonesKg,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await db.weightPlans.put(plan);
  return plan;
}

export async function putWeightPlan(plan: WeightPlan): Promise<void> {
  if (!isWeightPlan(plan)) {
    throw new Error("Invalid plan.");
  }

  await db.weightPlans.put(plan);
}

export async function deleteWeightPlan(): Promise<void> {
  await db.weightPlans.delete("default");
}

export function isWeightPlan(value: unknown): value is WeightPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Record<string, unknown>;

  return (
    plan.id === "default" &&
    typeof plan.startWeightKg === "number" &&
    Number.isFinite(plan.startWeightKg) &&
    typeof plan.targetWeightKg === "number" &&
    Number.isFinite(plan.targetWeightKg) &&
    plan.startWeightKg > plan.targetWeightKg &&
    typeof plan.heightCm === "number" &&
    Number.isFinite(plan.heightCm) &&
    plan.heightCm > 0 &&
    (plan.sex === "male" || plan.sex === "female") &&
    typeof plan.age === "number" &&
    Number.isFinite(plan.age) &&
    plan.age > 0 &&
    (plan.activityLevel === "sedentary" ||
      plan.activityLevel === "light" ||
      plan.activityLevel === "moderate" ||
      plan.activityLevel === "active") &&
    Array.isArray(plan.milestonesKg) &&
    plan.milestonesKg.every((weightKg) => typeof weightKg === "number" && Number.isFinite(weightKg)) &&
    typeof plan.createdAt === "string" &&
    typeof plan.updatedAt === "string"
  );
}

function validateWeightPlanInput(input: WeightPlanInput): void {
  if (!Number.isFinite(input.startWeightKg) || input.startWeightKg <= 0) {
    throw new Error("Enter a valid start weight.");
  }
  if (!Number.isFinite(input.targetWeightKg) || input.targetWeightKg <= 0) {
    throw new Error("Enter a valid target weight.");
  }
  if (input.startWeightKg <= input.targetWeightKg) {
    throw new Error("Target weight must be lower than start weight.");
  }
  if (!Number.isFinite(input.heightCm) || input.heightCm <= 0) {
    throw new Error("Enter a valid height.");
  }
  if (!Number.isFinite(input.age) || input.age <= 0) {
    throw new Error("Enter a valid age.");
  }
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}
