import { useMemo, useState } from "react";
import { PageHeaderRow } from "@/components/navigation/PageHeaderRow";
import { generateMilestones } from "@/domain/milestones";
import { activityLevelDescriptions, activityLevelLabels, type ActivityLevel, type Sex, type WeightPlan, type WeightPlanInput } from "@/types/plan";

type Props = {
  plan: WeightPlan | null;
  onOpenSidebar: () => void;
  onSavePlan: (input: WeightPlanInput) => Promise<void>;
  onRequestDeletePlan: () => void;
};

const defaultActivityLevel: ActivityLevel = "sedentary";
const defaultSex: Sex = "male";

export function PlanPage({ plan, onOpenSidebar, onSavePlan, onRequestDeletePlan }: Props) {
  return (
    <>
      <PageHeaderRow leftAction={{ kind: "menu", onClick: onOpenSidebar }} />
      <PlanEditor key={plan?.updatedAt ?? "new"} plan={plan} onSavePlan={onSavePlan} onRequestDeletePlan={onRequestDeletePlan} />
    </>
  );
}

type PlanEditorProps = {
  plan: WeightPlan | null;
  onSavePlan: (input: WeightPlanInput) => Promise<void>;
  onRequestDeletePlan: () => void;
};

function PlanEditor({ plan, onSavePlan, onRequestDeletePlan }: PlanEditorProps) {
  const [startWeightKg, setStartWeightKg] = useState(() => plan?.startWeightKg.toString() ?? "");
  const [targetWeightKg, setTargetWeightKg] = useState(() => plan?.targetWeightKg.toString() ?? "");
  const [heightCm, setHeightCm] = useState(() => plan?.heightCm.toString() ?? "");
  const [sex, setSex] = useState<Sex>(plan?.sex ?? defaultSex);
  const [age, setAge] = useState(() => plan?.age.toString() ?? "");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(plan?.activityLevel ?? defaultActivityLevel);
  const [milestonesText, setMilestonesText] = useState(() => plan?.milestonesKg.join(", ") ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatedMilestones = useMemo(() => {
    const start = Number(startWeightKg);
    const target = Number(targetWeightKg);
    const height = Number(heightCm);
    if (!Number.isFinite(start) || !Number.isFinite(target) || !Number.isFinite(height) || start <= target || height <= 0) {
      return [];
    }
    return generateMilestones({ startWeightKg: start, targetWeightKg: target, heightCm: height });
  }, [heightCm, startWeightKg, targetWeightKg]);

  function fillGeneratedMilestones() {
    setMilestonesText(generatedMilestones.join(", "));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const input = parsePlanInput({
      startWeightKg,
      targetWeightKg,
      heightCm,
      sex,
      age,
      activityLevel,
      milestonesText,
    });

    if (typeof input === "string") {
      setError(input);
      return;
    }

    setBusy(true);
    try {
      await onSavePlan(input);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save plan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="card plan-intro-card">
        <h2>{plan ? "Weight plan" : "Set up your plan"}</h2>
        <p className="muted">
          The plan stores your route, milestones, and conservative energy reference. Daily use still only requires body weight.
        </p>
      </section>

      <form className="card plan-form" onSubmit={handleSubmit}>
        <div className="plan-form__grid">
          <label>
            Start weight (kg)
            <input inputMode="decimal" value={startWeightKg} onChange={(event) => setStartWeightKg(event.target.value)} placeholder="121" required />
          </label>
          <label>
            Target weight (kg)
            <input inputMode="decimal" value={targetWeightKg} onChange={(event) => setTargetWeightKg(event.target.value)} placeholder="80" required />
          </label>
          <label>
            Height (cm)
            <input inputMode="numeric" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} placeholder="175" required />
          </label>
          <label>
            Age
            <input inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value)} placeholder="25" required />
          </label>
          <label>
            Sex
            <select value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label>
            Activity level
            <select value={activityLevel} onChange={(event) => setActivityLevel(event.target.value as ActivityLevel)}>
              {Object.entries(activityLevelLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        <p className="muted plan-form__hint">{activityLevelDescriptions[activityLevel]}</p>

        <label>
          Milestones (kg)
          <textarea
            rows={3}
            value={milestonesText}
            onChange={(event) => setMilestonesText(event.target.value)}
            placeholder="115, 110, 107, 100, 95, 92, 90, 85, 80"
          />
        </label>

        <div className="milestone-preview" aria-live="polite">
          <strong>Auto-generated milestones</strong>
          {generatedMilestones.length > 0 ? (
            <span>{generatedMilestones.join(" → ")}</span>
          ) : (
            <span className="muted">Enter start, target, and height to generate milestones.</span>
          )}
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="plan-form__actions">
          <button type="submit" disabled={busy}>{busy ? "Saving..." : plan ? "Save plan" : "Create plan"}</button>
          <button type="button" className="secondary" onClick={fillGeneratedMilestones} disabled={generatedMilestones.length === 0 || busy}>
            Use generated
          </button>
          {plan ? (
            <button type="button" className="ghost ghost-danger plan-form__delete" onClick={onRequestDeletePlan} disabled={busy}>
              Delete plan
            </button>
          ) : null}
        </div>
      </form>
    </>
  );
}

function parsePlanInput(input: {
  startWeightKg: string;
  targetWeightKg: string;
  heightCm: string;
  sex: Sex;
  age: string;
  activityLevel: ActivityLevel;
  milestonesText: string;
}): WeightPlanInput | string {
  const startWeightKg = Number(input.startWeightKg);
  const targetWeightKg = Number(input.targetWeightKg);
  const heightCm = Number(input.heightCm);
  const age = Number(input.age);
  const milestonesKg = input.milestonesText
    .split(/[\s,;→]+/u)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number);

  if (!Number.isFinite(startWeightKg) || startWeightKg <= 0) return "Enter a valid start weight.";
  if (!Number.isFinite(targetWeightKg) || targetWeightKg <= 0) return "Enter a valid target weight.";
  if (startWeightKg <= targetWeightKg) return "Target weight must be lower than start weight.";
  if (!Number.isFinite(heightCm) || heightCm <= 0) return "Enter a valid height.";
  if (!Number.isFinite(age) || age <= 0) return "Enter a valid age.";
  if (input.milestonesText.trim() && milestonesKg.some((weightKg) => !Number.isFinite(weightKg))) {
    return "Milestones must be numbers separated by commas.";
  }

  return {
    startWeightKg,
    targetWeightKg,
    heightCm,
    sex: input.sex,
    age,
    activityLevel: input.activityLevel,
    milestonesKg: input.milestonesText.trim() ? milestonesKg : undefined,
  };
}
