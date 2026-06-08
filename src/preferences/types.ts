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

export type FixedIanaTimezonePreference = {
  mode: "fixed";
  kind: "iana";
  timezone: string;
};

export type FixedUtcOffsetTimezonePreference = {
  mode: "fixed";
  kind: "utc_offset";
  offsetMinutes: number;
  label: string;
};

export type FixedTimezonePreference = FixedIanaTimezonePreference | FixedUtcOffsetTimezonePreference;

export type TimezonePreference =
  | { mode: "auto" }
  | FixedTimezonePreference;

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
