import type { TrendRange } from "../domain/weightStats";

export type DashboardMode = "phase" | "full";

export type DashboardPreferences = {
  progressMode: DashboardMode;
  trendModePreference: DashboardMode;
  trendRange: TrendRange;
};

export type PersistedPreferenceSection<T> = {
  version: 1;
  data: T;
};

export const defaultDashboardPreferences: DashboardPreferences = {
  progressMode: "phase",
  trendModePreference: "phase",
  trendRange: "1m",
};
