import type { TrendRange } from "@/domain/weightStats";

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

export type TimezonePreference =
  | { mode: "auto" }
  | { mode: "fixed"; timezone: string };

export type AppPreferences = {
  dashboard: DashboardPreferences;
  timezone: TimezonePreference;
};

export const defaultDashboardPreferences: DashboardPreferences = {
  progressMode: "phase",
  trendModePreference: "phase",
  trendRange: "1m",
};

export const defaultTimezonePreference: TimezonePreference = {
  mode: "auto",
};

export const defaultAppPreferences: AppPreferences = {
  dashboard: defaultDashboardPreferences,
  timezone: defaultTimezonePreference,
};
