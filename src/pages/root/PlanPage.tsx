import { useMemo, useState } from "react";
import { useTranslation } from "@/i18n";
import { E } from "@/i18n/errorCodes";
import { PageHeaderRow } from "@/components/navigation/PageHeaderRow";
import { generateMilestones } from "@/domain/milestones";
import { getActivityLevelDescription, getActivityLevelLabel, type ActivityLevel, type Sex, type WeightPlan, type WeightPlanInput } from "@/types/plan";

type Props = {
  plan: WeightPlan | null;
  onOpenSidebar: () => void;
  onSavePlan: (input: WeightPlanInput) => Promise<void>;
  onRequestDeletePlan: () => void;
};

const defaultActivityLevel: ActivityLevel = "sedentary";
const defaultSex: Sex = "male";
const allActivityLevels: ActivityLevel[] = ["sedentary", "light", "moderate", "active"];
const allSexes: Sex[] = ["male", "female"];

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
  const { t } = useTranslation();
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
      setError(caught instanceof Error ? caught.message : t("toast.couldNotSavePlan"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <section className="card plan-intro-card">
        <h2>{plan ? t("plan.title") : t("plan.setUpTitle")}</h2>
        <p className="muted">
          {t("plan.intro")}
        </p>
      </section>

      <form className="card plan-form" onSubmit={handleSubmit}>
        <div className="plan-form__grid">
          <label>
            {t("plan.startWeight")}
            <input inputMode="decimal" value={startWeightKg} onChange={(event) => setStartWeightKg(event.target.value)} placeholder={t("plan.startWeightPlaceholder")} required />
          </label>
          <label>
            {t("plan.targetWeight")}
            <input inputMode="decimal" value={targetWeightKg} onChange={(event) => setTargetWeightKg(event.target.value)} placeholder={t("plan.targetWeightPlaceholder")} required />
          </label>
          <label>
            {t("plan.height")}
            <input inputMode="numeric" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} placeholder={t("plan.heightPlaceholder")} required />
          </label>
          <label>
            {t("plan.age")}
            <input inputMode="numeric" value={age} onChange={(event) => setAge(event.target.value)} placeholder={t("plan.agePlaceholder")} required />
          </label>
          <label>
            {t("plan.sex")}
            <select value={sex} onChange={(event) => setSex(event.target.value as Sex)}>
              {allSexes.map((value) => (
                <option key={value} value={value}>{t(`plan.${value}`)}</option>
              ))}
            </select>
          </label>
          <label>
            {t("plan.activity")}
            <select value={activityLevel} onChange={(event) => setActivityLevel(event.target.value as ActivityLevel)}>
              {allActivityLevels.map((value) => (
                <option key={value} value={value}>{getActivityLevelLabel(value)}</option>
              ))}
            </select>
          </label>
        </div>

        <p className="muted plan-form__hint">{getActivityLevelDescription(activityLevel)}</p>

        <label>
          {t("plan.milestones")}
          <textarea
            rows={3}
            value={milestonesText}
            onChange={(event) => setMilestonesText(event.target.value)}
            placeholder={t("plan.milestonesPlaceholder")}
          />
        </label>

        <div className="milestone-preview" aria-live="polite">
          <strong>{t("plan.generatedMilestones")}</strong>
          {generatedMilestones.length > 0 ? (
            <span>{generatedMilestones.join(" → ")}</span>
          ) : (
            <span className="muted">{t("plan.enterToGenerate")}</span>
          )}
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="plan-form__actions">
          <button type="submit" disabled={busy}>{busy ? t("common.saving") : plan ? t("plan.savePlan") : t("plan.createPlan")}</button>
          <button type="button" className="secondary" onClick={fillGeneratedMilestones} disabled={generatedMilestones.length === 0 || busy}>
            {t("plan.useGenerated")}
          </button>
          {plan ? (
            <button type="button" className="ghost ghost-danger plan-form__delete" onClick={onRequestDeletePlan} disabled={busy}>
              {t("plan.deletePlan")}
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

  if (!Number.isFinite(startWeightKg) || startWeightKg <= 0) return E.INVALID_START_WEIGHT;
  if (!Number.isFinite(targetWeightKg) || targetWeightKg <= 0) return E.INVALID_TARGET_WEIGHT;
  if (startWeightKg <= targetWeightKg) return E.TARGET_NOT_LOWER;
  if (!Number.isFinite(heightCm) || heightCm <= 0) return E.INVALID_HEIGHT;
  if (!Number.isFinite(age) || age <= 0) return E.INVALID_AGE;
  if (input.milestonesText.trim() && milestonesKg.some((weightKg) => !Number.isFinite(weightKg))) {
    return E.MILESTONES_INVALID;
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
