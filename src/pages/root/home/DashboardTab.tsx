import { format, subDays } from "date-fns";
import { getChartPoints } from "../../../domain/weightStats";
import { getPlanSummary } from "../../../domain/planSummary";
import { trendLabelDescription, trendLabelText } from "../../../domain/trend";
import { WeightList } from "../../../components/WeightList";
import type { WeightPlan } from "../../../types/plan";
import type { WeightEntry } from "../../../types/weight";

type Props = {
  entries: WeightEntry[];
  plan: WeightPlan | null;
  standalone: boolean;
  onDelete: (id: string) => Promise<void>;
  onOpenPlan: () => void;
};

export function DashboardTab({ entries, plan, standalone, onDelete, onOpenPlan }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");
  const cutoffDate = format(subDays(new Date(), 2), "yyyy-MM-dd");
  const recentEntries = entries.filter((entry) => entry.date >= cutoffDate && entry.date <= today);
  const summary = getPlanSummary({ entries, plan });
  const chartPoints = getChartPoints(entries, 30);

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
            Add your start weight, target weight, height, sex, age, and activity level to unlock milestones, trend judgment, BMI, and conservative daily expenditure.
          </p>
          <button type="button" onClick={onOpenPlan}>Set up plan</button>
        </section>
      ) : null}

      <section className="dashboard-grid" aria-label="Dashboard summary">
        <MetricCard label="Latest weight" value={formatKg(summary.latestWeightKg)} detail={summary.latestWeightKg === null ? "Record your first weight." : "Most recent record"} />
        <MetricCard label="Recommendation" value={trendLabelText[summary.trend.label]} detail={trendLabelDescription[summary.trend.label]} tone={summary.trend.label} />
      </section>

      <section className="card phase-card">
        <div className="card-heading-row">
          <div>
            <h2>Current phase</h2>
            <p className="muted">Milestone progress based on your latest recorded weight.</p>
          </div>
          {plan ? <button type="button" className="ghost" onClick={onOpenPlan}>Edit plan</button> : null}
        </div>
        {summary.currentPhase ? (
          <>
            <div className="phase-card__range">
              <strong>{formatKg(summary.currentPhase.fromKg)}</strong>
              <span>→</span>
              <strong>{formatKg(summary.currentPhase.toKg)}</strong>
            </div>
            <div className="progress-bar" aria-label="Current phase progress">
              <span style={{ width: `${Math.round(summary.currentPhase.progressPct * 100)}%` }} />
            </div>
            <p className="muted">
              {summary.currentPhase.isFinalReached
                ? "Final target reached."
                : `${formatKg(summary.currentPhase.completedKg)} of ${formatKg(summary.currentPhase.totalKg)} completed in this phase.`}
            </p>
          </>
        ) : (
          <p className="muted">Create a plan and record a weight to show the current phase.</p>
        )}
      </section>

      <section className="card trend-card">
        <h2>Recent trend</h2>
        <div className="trend-card__grid">
          <MetricCard label="Recent 7 avg" value={formatKg(summary.weekly.recentAvgKg)} detail={`${summary.weekly.recentEntriesCount}/7 records`} />
          <MetricCard label="Previous 7 avg" value={formatKg(summary.weekly.previousAvgKg)} detail={`${summary.weekly.previousEntriesCount}/7 records`} />
          <MetricCard label="Change" value={formatLoss(summary.weekly.weeklyLossKg)} detail={summary.weekly.enoughData ? "Recent vs previous 7 records" : "Need 14 records"} />
        </div>
      </section>

      <section className="card chart-card">
        <h2>Weight trend</h2>
        {chartPoints.length >= 2 ? <WeightTrendChart points={chartPoints} targetWeightKg={plan?.targetWeightKg ?? null} /> : <p className="muted">Record at least two weights to draw a trend.</p>}
      </section>

      <section className="card reference-card">
        <h2>Reference metrics</h2>
        <div className="reference-grid">
          <MetricCard label="Total loss" value={formatKg(summary.metrics.totalLossKg)} detail="Since start weight" />
          <MetricCard label="Remaining" value={formatKg(summary.metrics.remainingLossKg)} detail="To target weight" />
          <MetricCard label="BMI" value={formatNumber(summary.metrics.bmi, 1)} detail="Based on latest weight" />
          <MetricCard label="Daily expenditure" value={formatKcal(summary.metrics.tdeeKcal)} detail="Conservative TDEE estimate" />
        </div>
        {summary.metrics.tdeeKcal !== null ? (
          <p className="muted reference-card__note">
            Daily expenditure uses current weight, height, age, sex, and activity level. Trend judgment still comes from weight records.
          </p>
        ) : null}
      </section>

      <WeightList entries={recentEntries} onDelete={onDelete} title="Recent records" emptyMessage="No recent records." />
    </>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: string;
};

function MetricCard({ label, value, detail, tone }: MetricCardProps) {
  return (
    <div className="metric-card" data-tone={tone}>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
      <span className="metric-card__detail">{detail}</span>
    </div>
  );
}

type ChartPoint = {
  date: string;
  weightKg: number;
  movingAverageKg: number | null;
};

function WeightTrendChart({ points, targetWeightKg }: { points: ChartPoint[]; targetWeightKg: number | null }) {
  const values = points.flatMap((point) => [point.weightKg, point.movingAverageKg].filter((value): value is number => value !== null));
  if (targetWeightKg !== null) values.push(targetWeightKg);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = Math.max(0.5, (max - min) * 0.12);
  const minY = min - padding;
  const maxY = max + padding;
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
  const targetY = targetWeightKg === null ? null : y(targetWeightKg);

  return (
    <div className="chart-wrap" role="img" aria-label="Weight trend chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="weight-chart">
        <line x1={padLeft} x2={width - padRight} y1={padTop} y2={padTop} className="chart-grid-line" />
        <line x1={padLeft} x2={width - padRight} y1={padTop + plotHeight / 2} y2={padTop + plotHeight / 2} className="chart-grid-line" />
        <line x1={padLeft} x2={width - padRight} y1={height - padBottom} y2={height - padBottom} className="chart-grid-line" />
        <text x={4} y={padTop + 4} className="chart-label">{formatKg(maxY)}</text>
        <text x={4} y={height - padBottom + 4} className="chart-label">{formatKg(minY)}</text>
        {targetY !== null ? (
          <>
            <line x1={padLeft} x2={width - padRight} y1={targetY} y2={targetY} className="chart-target-line" />
            <text x={padLeft + 4} y={targetY - 6} className="chart-label">Target</text>
          </>
        ) : null}
        <path d={weightPath} className="chart-line chart-line--weight" />
        {averagePath ? <path d={averagePath} className="chart-line chart-line--average" /> : null}
        {points.map((point, index) => (
          <circle key={point.date} cx={x(index)} cy={y(point.weightKg)} r="3.2" className="chart-point" />
        ))}
        <text x={padLeft} y={height - 9} className="chart-label">{points[0]?.date}</text>
        <text x={width - padRight} y={height - 9} textAnchor="end" className="chart-label">{points[points.length - 1]?.date}</text>
      </svg>
      <div className="chart-legend">
        <span><i className="legend-dot legend-dot--weight" /> Weight</span>
        <span><i className="legend-dot legend-dot--average" /> Moving avg</span>
        {targetWeightKg !== null ? <span><i className="legend-dot legend-dot--target" /> Target</span> : null}
      </div>
    </div>
  );
}

function toPath(points: Array<[number, number]>): string {
  if (points.length === 0) return "";
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

function formatKg(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} kg`;
}

function formatNumber(value: number | null, digits: number): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toFixed(digits);
}

function formatKcal(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return `≈ ${Math.round(value)} kcal/day`;
}

function formatLoss(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value > 0) return `Down ${value.toFixed(1)} kg`;
  if (value < 0) return `Up ${Math.abs(value).toFixed(1)} kg`;
  return "No change";
}
