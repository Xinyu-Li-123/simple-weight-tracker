const MIN_DISTANCE_BETWEEN_MILESTONES_KG = 2;

type MilestoneCandidate = {
  weightKg: number;
  priority: number;
  reason: "five_kg" | "bmi" | "target";
};

export function generateMilestones(input: {
  startWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
}): number[] {
  const { startWeightKg, targetWeightKg, heightCm } = input;

  if (!Number.isFinite(startWeightKg) || !Number.isFinite(targetWeightKg) || !Number.isFinite(heightCm)) {
    return [];
  }

  if (startWeightKg <= targetWeightKg) {
    return [roundWeight(targetWeightKg)];
  }

  const candidates: MilestoneCandidate[] = [];

  let next = Math.floor(startWeightKg / 5) * 5;
  if (next >= startWeightKg) next -= 5;

  while (next > targetWeightKg) {
    candidates.push({ weightKg: next, priority: 1, reason: "five_kg" });
    next -= 5;
  }

  const heightM = heightCm / 100;
  for (const bmi of [35, 30, 25]) {
    const weightKg = Math.round(bmi * heightM * heightM);
    if (weightKg < startWeightKg && weightKg > targetWeightKg) {
      candidates.push({ weightKg, priority: 2, reason: "bmi" });
    }
  }

  candidates.push({ weightKg: targetWeightKg, priority: 3, reason: "target" });

  const byRoundedWeight = new Map<number, MilestoneCandidate>();
  for (const candidate of candidates) {
    const roundedWeight = roundWeight(candidate.weightKg);
    const existing = byRoundedWeight.get(roundedWeight);
    if (!existing || candidate.priority > existing.priority) {
      byRoundedWeight.set(roundedWeight, { ...candidate, weightKg: roundedWeight });
    }
  }

  const sorted = [...byRoundedWeight.values()].sort((a, b) => b.weightKg - a.weightKg);
  const cleaned: MilestoneCandidate[] = [];

  for (const candidate of sorted) {
    const closeIndex = cleaned.findIndex(
      (item) => Math.abs(item.weightKg - candidate.weightKg) < MIN_DISTANCE_BETWEEN_MILESTONES_KG,
    );

    if (closeIndex < 0) {
      cleaned.push(candidate);
      continue;
    }

    if (candidate.priority > cleaned[closeIndex].priority) {
      cleaned[closeIndex] = candidate;
    }
  }

  return cleaned.sort((a, b) => b.weightKg - a.weightKg).map((item) => item.weightKg);
}

export function normalizeMilestones(input: {
  startWeightKg: number;
  targetWeightKg: number;
  milestonesKg: number[];
}): number[] {
  const { startWeightKg, targetWeightKg, milestonesKg } = input;
  const seen = new Set<number>();
  const normalized: number[] = [];

  for (const raw of milestonesKg) {
    if (!Number.isFinite(raw)) continue;
    const weightKg = roundWeight(raw);
    if (weightKg >= startWeightKg || weightKg < targetWeightKg) continue;
    if (seen.has(weightKg)) continue;
    seen.add(weightKg);
    normalized.push(weightKg);
  }

  if (!seen.has(roundWeight(targetWeightKg))) {
    normalized.push(roundWeight(targetWeightKg));
  }

  return normalized.sort((a, b) => b - a);
}

function roundWeight(value: number): number {
  return Math.round(value * 10) / 10;
}
