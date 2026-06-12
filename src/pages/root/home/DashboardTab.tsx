import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { getBmiCategory, getBmiCategoryLabel } from "@/domain/energy";
import { getPlanSummary } from "@/domain/planSummary";
import { getTrendLabelText, type TrendLabel, type TrendResult } from "@/domain/trend";
import { getTrendChartData, type TrendChartData, type TrendRange, type TrendOverlayPoint } from "@/domain/weightStats";
import { useTranslation } from "@/i18n";
import type { DashboardMode, DashboardPreferences } from "@/preferences/types";
import type { WeightPlan } from "@/types/plan";
import type { WeightEntry } from "@/types/weight";
import type { TFunction } from "i18next";
import type { PlanSummary } from "@/domain/planSummary";

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

export function DashboardTab({ entries, plan, standalone, onOpenPlan, preferences, onChangePreferences }: Props) {
  const { t } = useTranslation();
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
    weekly: summary.weekly,
    trend: summary.trend,
    t,
  });
  const bmiLine = getBmiLine({ hasPlan: Boolean(plan), bmi: summary.metrics.bmi, t });
  const bmiNormalLine = plan ? t("dashboard.bmiCategory_normal") : null;
  const tdeeLine = getTdeeLine({ hasPlan: Boolean(plan), tdeeKcal: summary.metrics.tdeeKcal, t });
  const calDeficitLine = getCalDeficitLine({ tdeeKcal: summary.metrics.tdeeKcal, t });

  const trendRangeOptions: Array<{ id: TrendRange; label: string }> = [
    { id: "10d", label: t("dashboard.10d") },
    { id: "1m", label: t("dashboard.1m") },
    { id: "3m", label: t("dashboard.3m") },
    { id: "6m", label: t("dashboard.6m") },
    { id: "1y", label: t("dashboard.1y") },
    { id: "all", label: t("dashboard.all") },
  ];

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
            <strong>{t("standalone.warning")}</strong>
            <p>{t("standalone.iphone")}</p>
            <p>{t("standalone.android")}</p>
          </div>
        </section>
      ) : null}

      {!plan ? (
        <section className="card dashboard-empty-plan">
          <h2>{t("dashboard.setUpPlanTitle")}</h2>
          <p className="muted">
            {t("dashboard.setUpPlanDesc")}
          </p>
          <button type="button" onClick={onOpenPlan}>{t("dashboard.setUpPlanButton")}</button>
        </section>
      ) : null}

      <section className={plan ? "card dashboard-card" : "card dashboard-card dashboard-card--disabled"}>
        <div className="dashboard-card__header">
          <h2>{t("dashboard.progress")}</h2>
          {plan ? (
            <div className="dashboard-card__mode-toggle" role="tablist" aria-label={t("dashboard.progressScopeAriaLabel")}>
              <button
                type="button"
                className={progressMode === "phase" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                aria-pressed={progressMode === "phase"}
                onClick={() => updatePreferences({ progressMode: "phase" })}
              >
                {t("dashboard.phase")}
              </button>
              <button
                type="button"
                className={progressMode === "full" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                aria-pressed={progressMode === "full"}
                onClick={() => updatePreferences({ progressMode: "full" })}
              >
                {t("dashboard.full")}
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
              ariaLabel={progressMode === "phase" ? t("dashboard.phase") : t("dashboard.full")}
            />

            <div className="dashboard-note" data-tone={plan ? summary.trend.label : undefined}>
              <strong><span>{t("dashboard.advice")}:&nbsp;&nbsp;</span>{recommendation.title}</strong>
              <span>{recommendation.detail}</span>
            </div>

            <div className="dashboard-metrics-group">
              <p className="dashboard-secondary-text muted">{bmiLine} {bmiNormalLine}</p>
              <p className="dashboard-secondary-text muted">{tdeeLine} {calDeficitLine}</p>
            </div>
          </>
        ) : (
          <>
            <HalfCircleGauge
              range={null}
              currentWeightKg={null}
              progressPct={null}
              totalLossKg={null}
              ariaLabel={t("dashboard.progressAriaLabel")}
            />

            <div className="dashboard-note">
              <strong>{recommendation.title}</strong>
              <span>{recommendation.detail}</span>
            </div>

            <div className="dashboard-metrics-group">
              <p className="dashboard-secondary-text muted">{bmiLine}</p>
              <p className="dashboard-secondary-text muted">{tdeeLine}</p>
            </div>
          </>
        )}
      </section>

      <section className={plan ? "card dashboard-card" : "card dashboard-card dashboard-card--disabled"}>
        <div className="dashboard-card__header">
          <h2>{t("dashboard.trend")}</h2>
          {plan ? (
            <div className="dashboard-card__mode-toggle" role="tablist" aria-label={t("dashboard.trendScopeAriaLabel")}>
              {trendPhaseAllowed ? (
                <button
                  type="button"
                  className={trendMode === "phase" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                  aria-pressed={trendMode === "phase"}
                  onClick={() => updatePreferences({ trendModePreference: "phase" })}
                >
                  {t("dashboard.phase")}
                </button>
              ) : null}
              <button
                type="button"
                className={trendMode === "full" ? "dashboard-card__mode-button dashboard-card__mode-button--active" : "dashboard-card__mode-button"}
                aria-pressed={trendMode === "full"}
                onClick={() => updatePreferences({ trendModePreference: "full" })}
              >
                {t("dashboard.full")}
              </button>
            </div>
          ) : null}
        </div>
        {plan ? (
          <div className="trend-controls">
            <div className="trend-range-toggle" role="tablist" aria-label={t("dashboard.trendRangeAriaLabel")}>
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
            <p className="muted">{t("dashboard.setUpPlanToUnlock")}</p>
          </div>
        ) : trendRangeBand && chartData.points.length >= 2 ? (
          <WeightTrendChart data={chartData} range={trendRangeBand} mode={trendMode} />
        ) : (
          <p className="muted">{t("dashboard.needTwoWeights")}</p>
        )}
      </section>

      {/* <section className="card"> */}
      {/*   <h2>Testing</h2> */}
      {/*   <div className="testing-panel__section"> */}
      {/*     <h3>Toast variants</h3> */}
      {/*     <div className="testing-panel__actions"> */}
      {/*       <button */}
      {/*         type="button" */}
      {/*         className="testing-panel__button" */}
      {/*         onClick={() => pushToast({ message: "Info notification", variant: "info" })} */}
      {/*       > */}
      {/*         Info */}
      {/*       </button> */}
      {/*       <button */}
      {/*         type="button" */}
      {/*         className="testing-panel__button" */}
      {/*         onClick={() => pushToast({ message: "Success notification", variant: "success" })} */}
      {/*       > */}
      {/*         Success */}
      {/*       </button> */}
      {/*       <button */}
      {/*         type="button" */}
      {/*         className="testing-panel__button" */}
      {/*         onClick={() => pushToast({ message: "Warning notification", variant: "warning" })} */}
      {/*       > */}
      {/*         Warning */}
      {/*       </button> */}
      {/*       <button */}
      {/*         type="button" */}
      {/*         className="testing-panel__button" */}
      {/*         onClick={() => pushToast({ message: "Error notification", variant: "error" })} */}
      {/*       > */}
      {/*         Error */}
      {/*       </button> */}
      {/*     </div> */}
      {/*   </div> */}
      {/* </section> */}
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
  const { t } = useTranslation();
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
              {t("dashboard.start")}
            </text>
            <text x="284" y="125" className="progress-gauge__edge-value" textAnchor="middle">
              {formatKg(input.range.toKg)}
            </text>
            <text x="284" y="142" className="progress-gauge__edge-caption" textAnchor="middle">
              {t("dashboard.target")}
            </text>
          </>
        ) : (
          <>
            <text x="44" y="125" className="progress-gauge__edge-value" textAnchor="middle">
              —
            </text>
            <text x="44" y="142" className="progress-gauge__edge-caption" textAnchor="middle">
              {t("dashboard.start")}
            </text>
            <text x="276" y="125" className="progress-gauge__edge-value" textAnchor="middle">
              —
            </text>
            <text x="276" y="142" className="progress-gauge__edge-caption" textAnchor="middle">
              {t("dashboard.target")}
            </text>
          </>
        )}
        <text x={centerX} y="12" className="progress-gauge__current-caption" textAnchor="middle">
          {t("dashboard.current")}
        </text>
        <text x={centerX} y="34" className="progress-gauge__current-value" textAnchor="middle">
          {formatKg(input.currentWeightKg)}
        </text>
        <text x={centerX} y={centerY - 34} className="progress-gauge__center-caption" textAnchor="middle">
          {t("dashboard.totalLoss")}
        </text>
        <text x={centerX} y={centerY - 4} className="progress-gauge__center-value" textAnchor="middle">
          {formatKg(input.totalLossKg)}
        </text>
      </svg>
    </div>
  );
}

function WeightTrendChart({ data, range, mode }: { data: TrendChartData; range: ActiveRange; mode: DashboardMode }) {
  const { t } = useTranslation();
  const { points, overlayPoints, ticks, rangeStart, rangeEnd, usesWeeklyAverage } = data;

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
    daily: t("dashboard.chartWeight"),
    weekly: t("dashboard.chartWeeklyAverage"),
  } as const;
  const overlayData: TrendOverlayPoint[] | undefined = usesWeeklyAverage ? undefined : overlayPoints;
  const legendItems = usesWeeklyAverage
    ? [{ label: lineName.weekly, tone: "primary" as const, dashed: false }]
    : [
      { label: lineName.daily, tone: "primary" as const, dashed: false },
      { label: lineName.weekly, tone: "secondary" as const, dashed: true },
    ];

  function CustomXAxisTick(props: Record<string, unknown>) {
    const x = props.x as number;
    const y = props.y as number;
    const payload = props.payload as { value: number };
    const tick = ticks.find((t) => t.timestamp === payload.value);
    if (!tick) return null;

    if (tick.kind === "year_separator") {
      return (
        <g transform={`translate(${x},${y})`}>
          <line x1={0} y1={-200} x2={0} y2={30} stroke="var(--color-chart-axis)" strokeWidth={1} strokeDasharray="2 3" />
          <text x={15} y={18} textAnchor="middle" fill="var(--color-chart-axis)" fontSize={11} fontWeight={700}>
            {tick.label}
          </text>
        </g>
      );
    }

    return (
      <g transform={`translate(${x},${y})`}>
        <line x1={0} y1={-6} x2={0} y2={0} stroke="var(--color-chart-grid)" />
        <text x={0} y={0} textAnchor="middle" fill="var(--color-chart-axis)" fontSize={13} fontWeight={700}>
          {tick.label}
        </text>
      </g>
    );
  }

  return (
    <div className="chart-wrap" role="img" aria-label={t("dashboard.chartAriaLabel")}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={points} margin={{ top: 18, right: 18, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-chart-grid)" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={[rangeStart, rangeEnd]}
            padding={{ left: 15, right: 5 }}
            ticks={ticks.map((t) => t.timestamp)}
            interval={0}
            tick={CustomXAxisTick}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tickFormatter={formatWeight}
            tick={{ fontSize: 13, fontWeight: 700, fill: "var(--color-chart-axis)" }}
            axisLine={false}
            tickLine={false}
            width={64}
            padding={{ bottom: 20 }}
          />
          <Line
            name={usesWeeklyAverage ? lineName.weekly : lineName.daily}
            type="monotone"
            dataKey="weightKg"
            stroke="var(--color-chart-primary)"
            strokeWidth={2.6}
            dot={{ r: 2.8, fill: "var(--color-bg-surface)", stroke: "var(--color-chart-primary)", strokeWidth: 1.5 }}
            isAnimationActive={false}
            activeDot={false}
            connectNulls={false}
            zIndex={5}
          />
          {!usesWeeklyAverage && (
            <Line
              data={overlayData}
              name={lineName.weekly}
              type="linear"
              dataKey="valueKg"
              stroke="var(--color-chart-secondary)"
              strokeWidth={1.9}
              strokeOpacity={0.55}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
              activeDot={false}
              connectNulls={false}
              zIndex={4}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="chart-legend" aria-hidden="true">
        {legendItems.map((item) => (
          <span key={item.label} className="chart-legend__item">
            <span className={`chart-legend__swatch chart-legend__swatch--${item.tone}${item.dashed ? " chart-legend__swatch--dashed" : ""}`} />
            <span>{item.label}</span>
          </span>
        ))}
      </div>
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
  weekly: PlanSummary["weekly"];
  trend: TrendResult;
  t: TFunction;
}): { title: string; detail: string } {
  const { t } = input;

  if (!input.hasPlan) {
    return {
      title: t("dashboard.addPlanTitle"),
      detail: t("dashboard.addPlanDesc"),
    };
  }

  if (input.latestWeightKg === null) {
    return {
      title: t("dashboard.recordFirstWeight"),
      detail: t("dashboard.recordFirstWeightDesc"),
    };
  }

  if (
    input.weekly.enoughData &&
    input.weekly.recentAvgKg !== null &&
    input.weekly.previousAvgKg !== null &&
    input.trend.minLossKg !== null &&
    input.trend.maxLossKg !== null
  ) {
    const weeklyChangeKg = input.weekly.previousAvgKg - input.weekly.recentAvgKg;
    const roundedChangeKg = Number(weeklyChangeKg.toFixed(1));
    const changeKey =
      roundedChangeKg > 0 ? "dashboard.weeklyChangeDown" :
      roundedChangeKg < 0 ? "dashboard.weeklyChangeUp" :
      "dashboard.weeklyChangeSame";

    return {
      title: getTrendLabelText(input.trend.label),
      detail: t("dashboard.weeklySummaryDetail", {
        avgKg: formatWeightValue(input.weekly.recentAvgKg),
        changeText: t(changeKey, { kg: formatWeightValue(Math.abs(roundedChangeKg)) }),
        minKg: formatWeightValue(input.trend.minLossKg),
        maxKg: formatWeightValue(input.trend.maxLossKg),
      }),
    };
  }

  return {
    title: getTrendLabelText(input.trend.label as TrendLabel),
    detail: t(`trend.${input.trend.label}Desc`),
  };
}

function formatWeightValue(value: number): string {
  return value.toFixed(1);
}

function getBmiLine(input: { hasPlan: boolean; bmi: number | null; t: TFunction }): string {
  const { t, hasPlan, bmi } = input;

  if (!hasPlan) {
    return t("dashboard.bmiAppearsAfterPlan");
  }

  if (bmi === null) {
    return t("dashboard.bmiAppearsAfterLog");
  }

  const category = getBmiCategory(bmi);
  return t("dashboard.bmiCategory_current", { bmi: bmi.toFixed(1), category: getBmiCategoryLabel(category.category) });
}

function getTdeeLine(input: { hasPlan: boolean; tdeeKcal: number | null; t: TFunction }): string {
  const { t, hasPlan, tdeeKcal } = input;

  if (!hasPlan) {
    return t("dashboard.dailyBurnAppears");
  }

  if (tdeeKcal === null) {
    return t("dashboard.dailyBurnAfterLog");
  }

  return t("dashboard.dailyBurnAbout", { kcal: Math.round(tdeeKcal) });
}

function getCalDeficitLine(input: { tdeeKcal: number | null; t: TFunction }): string {
  const { t, tdeeKcal } = input;

  if (tdeeKcal === null) return "";

  const estiCalDeficit = tdeeKcal * 0.15;
  const recCalDeficit = Math.round(clamp(estiCalDeficit, 200, 500));

  return t("dashboard.dailyDeficit", { kcal: recCalDeficit });
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isShortTrendRange(range: TrendRange): boolean {
  return range === "10d" || range === "1m";
}
