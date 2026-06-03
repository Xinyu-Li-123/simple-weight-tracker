import { useState } from "react";
import { getPlanSummary } from "../../../domain/planSummary";
import { trendLabelDescription, trendLabelText, type TrendLabel } from "../../../domain/trend";
import { getChartPoints } from "../../../domain/weightStats";
import type { WeightPlan } from "../../../types/plan";
import type { WeightEntry } from "../../../types/weight";

type Props = {
  entries: WeightEntry[];
  plan: WeightPlan | null;
  standalone: boolean;
  onOpenPlan: () => void;
};

type DashboardMode = "phase" | "full";

type ActiveRange = {
  fromKg: number;
  toKg: number;
};

type ChartPoint = {
  date: string;
  weightKg: number;
  movingAverageKg: number | null;
};

export function DashboardTab({ entries, plan, standalone, onOpenPlan }: Props) {
  const [mode, setMode] = useState<DashboardMode>("phase");
  const summary = getPlanSummary({ entries, plan });
  const chartPoints = getChartPoints(entries, 30);
  const activeRange = getActiveRange({
    mode,
    plan,
    currentPhase: summary.currentPhase,
  });
  const progressMeter = getProgressMeter({
    mode,
    plan,
    latestWeightKg: summary.latestWeightKg,
    currentPhase: summary.currentPhase,
  });
  const recommendation = getRecommendationCopy({
    hasPlan: Boolean(plan),
    latestWeightKg: summary.latestWeightKg,
    trendLabel: summary.trend.label,
  });
  const tdeeLine = getTdeeLine({
    hasPlan: Boolean(plan),
    tdeeKcal: summary.metrics.tdeeKcal,
  });

  return (
    <>
      {!standalone ? (
        <section className="warning storage-warning">
          <div>
            <strong>Use this app from your Home Screen for real use.</strong>
            <p>iPhone: open in Safari, tap Share, then Add to Home Screen.</p>
            <p>Android: open the browser menu, then Install app or Add to Home screen.</p>
          </div>
        </section>
      ) : null}

      {!plan ? (
        <section className="card dashboard-empty-plan">
          <h2>Set up your plan</h2>
          <p className="muted">
            Add your start weight, target weight, height, sex, age, and activity level to unlock milestone progress and zoomed trend views.
          </p>
          <button type="button" onClick={onOpenPlan}>Set up plan</button>
        </section>
      ) : null}

      <section className="dashboard-mode-row" aria-label="Dashboard view mode">
        <div className="dashboard-mode-toggle" role="tablist" aria-label="Dashboard scope">
          <button
            type="button"
            className={mode === "phase" ? "dashboard-mode-toggle__button dashboard-mode-toggle__button--active" : "dashboard-mode-toggle__button"}
            aria-pressed={mode === "phase"}
            onClick={() => setMode("phase")}
            disabled={!plan}
          >
            Phase
          </button>
          <button
            type="button"
            className={mode === "full" ? "dashboard-mode-toggle__button dashboard-mode-toggle__button--active" : "dashboard-mode-toggle__button"}
            aria-pressed={mode === "full"}
            onClick={() => setMode("full")}
            disabled={!plan}
          >
            Full
          </button>
        </div>
      </section>

      <section className={plan ? "card dashboard-card" : "card dashboard-card dashboard-card--disabled"}>
        <div className="dashboard-card__header">
          <div>
            <h2>Progress</h2>
            <p className="muted">{mode === "phase" ? "Current milestone segment." : "Full route from start to target."}</p>
          </div>
        </div>

        {activeRange ? (
          <>
            <HalfCircleGauge
              range={activeRange}
              currentWeightKg={summary.latestWeightKg}
              progressPct={progressMeter?.progressPct ?? null}
              totalLossKg={summary.metrics.totalLossKg}
              ariaLabel={`${mode === "phase" ? "Current phase" : "Full plan"} progress`}
            />

            <div className="dashboard-note" data-tone={plan ? summary.trend.label : undefined}>
              <strong>{recommendation.title}</strong>
              <span>{recommendation.detail}</span>
            </div>

            <p className="dashboard-secondary-text muted">{tdeeLine}</p>
          </>
        ) : (
          <>
            <HalfCircleGauge
              range={null}
              currentWeightKg={null}
              progressPct={null}
              totalLossKg={null}
              ariaLabel="Progress placeholder"
            />

            <div className="dashboard-note">
              <strong>{recommendation.title}</strong>
              <span>{recommendation.detail}</span>
            </div>

            <p className="dashboard-secondary-text muted">{tdeeLine}</p>
          </>
        )}
      </section>

      <section className={plan ? "card dashboard-card" : "card dashboard-card dashboard-card--disabled"}>
        <div className="dashboard-card__header">
          <div>
            <h2>Trend</h2>
            <p className="muted">{mode === "phase" ? "Same records, zoomed to the current phase range." : "Same records across the full plan range."}</p>
          </div>
        </div>

        {!plan ? (
          <div className="trend-placeholder">
            <p className="muted">Set up a plan to unlock the phase and full trend views.</p>
          </div>
        ) : activeRange && chartPoints.length >= 2 ? (
          <WeightTrendChart points={chartPoints} range={activeRange} />
        ) : (
          <p className="muted">Record at least two weights to draw a trend.</p>
        )}
      </section>
    </>
  );
}

function HalfCircleGauge(input: {
  range: ActiveRange | null;
  currentWeightKg: number | null;
  progressPct: number | null;
  totalLossKg: number | null;
  ariaLabel: string;
}) {
  const width = 320;
  const height = 166;
  const centerX = width / 2;
  const centerY = 138;
  const radius = 88;
  const progressPct = input.progressPct === null ? null : clamp(input.progressPct, 0, 1);
  const marker = progressPct === null ? null : getGaugePoint({ centerX, centerY, radius, progressPct });
  const trackPath = createGaugePath({ centerX, centerY, radius, startPct: 0, endPct: 1 });
  const fillPath =
    progressPct === null || progressPct <= 0
      ? ""
      : createGaugePath({ centerX, centerY, radius, startPct: 0, endPct: progressPct });

  return (
    <div className={input.range ? "progress-gauge" : "progress-gauge progress-gauge--placeholder"} role="img" aria-label={input.ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} className="progress-gauge__svg">
        <path d={trackPath} className="progress-gauge__track" />
        {fillPath ? <path d={fillPath} className="progress-gauge__fill" /> : null}
        <circle cx={centerX} cy={centerY - 18} r="48" className="progress-gauge__center-disc" />
        {marker ? <circle cx={marker.x} cy={marker.y} r="7" className="progress-gauge__marker" /> : null}
        {input.range ? (
          <>
            <text x="34" y="125" className="progress-gauge__edge-value" textAnchor="middle">
              {formatKg(input.range.fromKg)}
            </text>
            <text x="34" y="142" className="progress-gauge__edge-caption" textAnchor="middle">
              Start
            </text>
            <text x="284" y="125" className="progress-gauge__edge-value" textAnchor="middle">
              {formatKg(input.range.toKg)}
            </text>
            <text x="284" y="142" className="progress-gauge__edge-caption" textAnchor="middle">
              Target
            </text>
          </>
        ) : (
          <>
            <text x="44" y="125" className="progress-gauge__edge-value" textAnchor="middle">
              —
            </text>
            <text x="44" y="142" className="progress-gauge__edge-caption" textAnchor="middle">
              Start
            </text>
            <text x="276" y="125" className="progress-gauge__edge-value" textAnchor="middle">
              —
            </text>
            <text x="276" y="142" className="progress-gauge__edge-caption" textAnchor="middle">
              Target
            </text>
          </>
        )}
        <text x={centerX} y="17" className="progress-gauge__current-caption" textAnchor="middle">
          Current
        </text>
        <text x={centerX} y="37" className="progress-gauge__current-value" textAnchor="middle">
          {formatKg(input.currentWeightKg)}
        </text>
        <text x={centerX} y={centerY - 36} className="progress-gauge__center-caption" textAnchor="middle">
          Total loss
        </text>
        <text x={centerX} y={centerY - 14} className="progress-gauge__center-value" textAnchor="middle">
          {formatKg(input.totalLossKg)}
        </text>
        <text x={centerX} y={centerY + 4} className="progress-gauge__center-detail" textAnchor="middle">
          lost so far
        </text>
      </svg>
    </div>
  );
}

function WeightTrendChart({ points, range }: { points: ChartPoint[]; range: ActiveRange }) {
  const padding = Math.max(0.5, (range.fromKg - range.toKg) * 0.08);
  const minY = range.toKg - padding;
  const maxY = range.fromKg + padding;
  const width = 720;
  const height = 260;
  const padLeft = 46;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 36;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  function x(index: number) {
    if (points.length <= 1) return padLeft;
    return padLeft + (index / (points.length - 1)) * plotWidth;
  }

  function y(value: number) {
    return padTop + ((maxY - value) / (maxY - minY)) * plotHeight;
  }

  const weightPath = toPath(points.map((point, index) => [x(index), y(point.weightKg)]));
  const averagePath = toPath(
    points
      .map((point, index) => (point.movingAverageKg === null ? null : [x(index), y(point.movingAverageKg)] as [number, number]))
      .filter((point): point is [number, number] => point !== null),
  );

  return (
    <div className="chart-wrap" role="img" aria-label="Weight trend chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="weight-chart">
        <line x1={padLeft} x2={width - padRight} y1={padTop} y2={padTop} className="chart-grid-line" />
        <line x1={padLeft} x2={width - padRight} y1={padTop + plotHeight / 2} y2={padTop + plotHeight / 2} className="chart-grid-line" />
        <line x1={padLeft} x2={width - padRight} y1={height - padBottom} y2={height - padBottom} className="chart-grid-line" />
        <text x={4} y={padTop + 4} className="chart-label">{formatKg(maxY)}</text>
        <text x={4} y={height - padBottom + 4} className="chart-label">{formatKg(minY)}</text>
        <path d={weightPath} className="chart-line chart-line--weight" />
        {averagePath ? <path d={averagePath} className="chart-line chart-line--average" /> : null}
        {points.map((point, index) => (
          <circle key={point.date} cx={x(index)} cy={y(point.weightKg)} r="3.2" className="chart-point" />
        ))}
        <text x={padLeft} y={height - 9} className="chart-label">{points[0]?.date}</text>
        <text x={width - padRight} y={height - 9} textAnchor="end" className="chart-label">{points[points.length - 1]?.date}</text>
      </svg>
    </div>
  );
}

function getActiveRange(input: {
  mode: DashboardMode;
  plan: WeightPlan | null;
  currentPhase: { fromKg: number; toKg: number } | null;
}): ActiveRange | null {
  if (!input.plan) return null;

  if (input.mode === "full") {
    return {
      fromKg: input.plan.startWeightKg,
      toKg: input.plan.targetWeightKg,
    };
  }

  if (input.currentPhase) {
    return {
      fromKg: input.currentPhase.fromKg,
      toKg: input.currentPhase.toKg,
    };
  }

  return {
    fromKg: input.plan.startWeightKg,
    toKg: input.plan.targetWeightKg,
  };
}

function getProgressMeter(input: {
  mode: DashboardMode;
  plan: WeightPlan | null;
  latestWeightKg: number | null;
  currentPhase: { fromKg: number; toKg: number } | null;
}): { progressPct: number } | null {
  const range = getActiveRange({
    mode: input.mode,
    plan: input.plan,
    currentPhase: input.currentPhase,
  });

  if (!range || input.latestWeightKg === null) return null;

  const totalKg = Math.max(0, range.fromKg - range.toKg);
  if (totalKg === 0) {
    return {
      progressPct: input.latestWeightKg <= range.toKg ? 1 : 0,
    };
  }

  const completedKg = clamp(range.fromKg - input.latestWeightKg, 0, totalKg);
  return {
    progressPct: completedKg / totalKg,
  };
}

function getRecommendationCopy(input: {
  hasPlan: boolean;
  latestWeightKg: number | null;
  trendLabel: TrendLabel;
}): { title: string; detail: string } {
  if (!input.hasPlan) {
    return {
      title: "Add a plan",
      detail: "Set up your plan to unlock phase progress and zoomed trend ranges.",
    };
  }

  if (input.latestWeightKg === null) {
    return {
      title: "Record your first weight",
      detail: "The dashboard will start tracking progress as soon as you log an entry.",
    };
  }

  return {
    title: trendLabelText[input.trendLabel],
    detail: trendLabelDescription[input.trendLabel],
  };
}

function getTdeeLine(input: { hasPlan: boolean; tdeeKcal: number | null }): string {
  if (!input.hasPlan) {
    return "Daily expenditure will appear after you save a plan.";
  }

  if (input.tdeeKcal === null) {
    return "Daily expenditure appears after you log a weight.";
  }

  return `Estimated daily expenditure: ${formatKcal(input.tdeeKcal)}.`;
}

function toPath(points: Array<[number, number]>): string {
  if (points.length === 0) return "";
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

function createGaugePath(input: {
  centerX: number;
  centerY: number;
  radius: number;
  startPct: number;
  endPct: number;
}): string {
  const startPct = clamp(input.startPct, 0, 1);
  const endPct = clamp(input.endPct, 0, 1);
  const steps = Math.max(2, Math.ceil((endPct - startPct) * 48));
  const points = Array.from({ length: steps + 1 }, (_, index) => {
    const progressPct = startPct + ((endPct - startPct) * index) / steps;
    return getGaugePoint({
      centerX: input.centerX,
      centerY: input.centerY,
      radius: input.radius,
      progressPct,
    });
  });

  return toPath(points.map((point) => [point.x, point.y]));
}

function getGaugePoint(input: {
  centerX: number;
  centerY: number;
  radius: number;
  progressPct: number;
}): { x: number; y: number } {
  const angle = Math.PI - clamp(input.progressPct, 0, 1) * Math.PI;

  return {
    x: input.centerX + input.radius * Math.cos(angle),
    y: input.centerY - input.radius * Math.sin(angle),
  };
}

function formatKg(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} kg`;
}

function formatKcal(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `≈ ${Math.round(value)} kcal/day`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
