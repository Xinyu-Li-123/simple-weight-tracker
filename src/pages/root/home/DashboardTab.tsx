import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, type LegendPayload } from "recharts";
import { getPlanSummary } from "@/domain/planSummary";
import { trendLabelDescription, trendLabelText, type TrendLabel } from "@/domain/trend";
import { getTrendChartData, type TrendChartData, type TrendRange } from "@/domain/weightStats";
import type { DashboardMode, DashboardPreferences } from "@/preferences/types";
import type { WeightPlan } from "@/types/plan";
import type { WeightEntry } from "@/types/weight";

type Props = {
  entries: WeightEntry[];
  plan: WeightPlan | null;
  standalone: boolean;
  onOpenPlan: () => void;
  preferences: DashboardPreferences;
  onChangePreferences: (preferences: DashboardPreferences) => void;
};

type ActiveRange = {
  fromKg: number;
  toKg: number;
};

const trendRangeOptions: Array<{ id: TrendRange; label: string }> = [
  { id: "10d", label: "10D" },
  { id: "1m", label: "1M" },
  { id: "3m", label: "3M" },
  { id: "6m", label: "6M" },
  { id: "1y", label: "1Y" },
  { id: "all", label: "All" },
];

export function DashboardTab({ entries, plan, standalone, onOpenPlan, preferences, onChangePreferences }: Props) {
  const { progressMode, trendModePreference, trendRange } = preferences;
  const summary = getPlanSummary({ entries, plan });
  const chartData = getTrendChartData(entries, trendRange);
  const progressRange = getActiveRange({
    mode: progressMode,
    plan,
    currentPhase: summary.currentPhase,
  });
  const trendPhaseAllowed = isShortTrendRange(trendRange);
  const trendMode = trendPhaseAllowed ? trendModePreference : "full";
  const trendRangeBand = getActiveRange({
    mode: trendMode,
    plan,
    currentPhase: summary.currentPhase,
  });
  const progressMeter = getProgressMeter({
    mode: progressMode,
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

  function updatePreferences(next: Partial<DashboardPreferences>) {
    onChangePreferences({
      ...preferences,
      ...next,
    });
  }

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

      <section className={plan ? "card dashboard-card" : "card dashboard-card dashboard-card--disabled"}>
        <div className="dashboard-card__header">
          <h2>Progress</h2>
          {plan ? (
            <div className="dashboard-card__mode-toggle" role="tablist" aria-label="Progress scope">
              <button
                type="button"
                className={progressMode === "phase" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                aria-pressed={progressMode === "phase"}
                onClick={() => updatePreferences({ progressMode: "phase" })}
              >
                Phase
              </button>
              <button
                type="button"
                className={progressMode === "full" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                aria-pressed={progressMode === "full"}
                onClick={() => updatePreferences({ progressMode: "full" })}
              >
                Full
              </button>
            </div>
          ) : null}
        </div>

        {progressRange ? (
          <>
            <HalfCircleGauge
              range={progressRange}
              currentWeightKg={summary.latestWeightKg}
              progressPct={progressMeter?.progressPct ?? null}
              totalLossKg={summary.metrics.totalLossKg}
              ariaLabel={`${progressMode === "phase" ? "Current phase" : "Full plan"} progress`}
            />

            <div className="dashboard-note" data-tone={plan ? summary.trend.label : undefined}>
              <strong><span>Advice:&nbsp;&nbsp;</span>{recommendation.title}</strong>
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
      </section >

      <section className={plan ? "card dashboard-card" : "card dashboard-card dashboard-card--disabled"}>
        <div className="dashboard-card__header">
          <h2>Trend</h2>
          {plan ? (
            <div className="dashboard-card__mode-toggle" role="tablist" aria-label="Trend scope">
              {trendPhaseAllowed ? (
                <button
                  type="button"
                  className={trendMode === "phase" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                  aria-pressed={trendMode === "phase"}
                  onClick={() => updatePreferences({ trendModePreference: "phase" })}
                >
                  Phase
                </button>
              ) : null}
              <button
                type="button"
                className={trendMode === "full" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                aria-pressed={trendMode === "full"}
                onClick={() => updatePreferences({ trendModePreference: "full" })}
              >
                Full
              </button>
            </div>
          ) : null}
        </div>
        {plan ? (
          <div className="trend-controls">
            <div className="trend-range-toggle" role="tablist" aria-label="Trend date range">
              {trendRangeOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={trendRange === option.id ? "trend-range-toggle__button trend-range-toggle__button--active" : "trend-range-toggle__button"}
                  aria-pressed={trendRange === option.id}
                  onClick={() => updatePreferences({ trendRange: option.id })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {!plan ? (
          <div className="trend-placeholder">
            <p className="muted">Set up a plan to unlock the phase and full trend views.</p>
          </div>
        ) : trendRangeBand && chartData.points.length >= 2 ? (
          <WeightTrendChart data={chartData} range={trendRangeBand} mode={trendMode} />
        ) : (
          <p className="muted">Record at least two weights in this range to draw a trend.</p>
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

function WeightTrendChart({ data, range, mode }: { data: TrendChartData; range: ActiveRange; mode: DashboardMode }) {
  const { points, ticks, rangeStart, rangeEnd, usesWeeklyAverage } = data;

  if (points.length === 0) return null;

  const isPhaseMode = mode === "phase";
  const phaseRange = range.fromKg - range.toKg;
  const padding = Math.max(0.5, phaseRange / 2);
  const yDomain: [number, number] = isPhaseMode
    ? [range.toKg - padding, range.fromKg + padding]
    : [range.toKg, range.fromKg];
  const yTicks = isPhaseMode ? [range.toKg, range.fromKg] : undefined;
  const formatWeight = (v: number) => `${v.toFixed(1)} kg`;

  const lineName = {
    daily: "Weight",
    movingAvg: "Moving Average",
    weekly: "Weekly Average"
  } as const;

  const legendOrder = new Map(
    Object.values(lineName).map((name, index) => [name, index]),
  );
  const sortLegendItem = (item: LegendPayload) =>
    legendOrder.get(String(item.value)) ?? Number.MAX_SAFE_INTEGER;

  function CustomXAxisTick(props: Record<string, unknown>) {
    const x = props.x as number;
    const y = props.y as number;
    const payload = props.payload as { value: number };
    const tick = ticks.find((t) => t.timestamp === payload.value);
    if (!tick) return null;

    const showYear = tick.kind && tick.kind !== "day" && tick.kind !== "year"
      ? new Date(tick.timestamp).getUTCMonth() === 0
      : false;

    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} textAnchor="middle" fill="#5d6878" fontSize={13} fontWeight={700}>
          {tick.label}
        </text>
        {showYear && (
          <text x={0} y={16} textAnchor="middle" fill="#5d6878" fontSize={11} fontWeight={700}>
            {new Date(tick.timestamp).getUTCFullYear()}
          </text>
        )}
      </g>
    );
  }

  return (
    <div className="chart-wrap" role="img" aria-label="Weight trend chart">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={points} margin={{ top: 18, right: 18, bottom: 36, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e7ed" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={[rangeStart, rangeEnd]}
            padding={{ left: 10, right: 5 }}
            ticks={ticks.map((t) => t.timestamp)}
            interval={0}
            tick={CustomXAxisTick}
            axisLine={false}
            tickLine={{ stroke: "#c4ccda" }}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={formatWeight}
            tick={{ fontSize: 13, fontWeight: 700, fill: "#5d6878" }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Line
            name={usesWeeklyAverage ? lineName.weekly : lineName.daily}
            type="monotone"
            dataKey="weightKg"
            stroke="#172033"
            strokeWidth={2.2}
            dot={{ r: 3.2, fill: "#fdfefe", stroke: "#5d6878", strokeWidth: 2 }}
            isAnimationActive={false}
            connectNulls={false}
            zIndex={5}
          />
          {!usesWeeklyAverage && (
            <Line
              name={lineName.movingAvg}
              type="monotone"
              dataKey="movingAverageKg"
              stroke="#5d6878"
              strokeWidth={3.2}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
              zIndex={4}
            />
          )}
          <Legend verticalAlign="bottom" height={30} wrapperStyle={{ fontSize: 12, fontWeight: 700 }} itemSorter={sortLegendItem} />
        </LineChart>
      </ResponsiveContainer>
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

function isShortTrendRange(range: TrendRange): boolean {
  return range === "10d" || range === "1m";
}
