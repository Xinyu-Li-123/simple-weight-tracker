import type { TrendRange } from "../domain/weightStats";
import {
  defaultDashboardPreferences,
  type DashboardMode,
  type DashboardPreferences,
  type PersistedPreferenceSection,
} from "./types";

const DASHBOARD_PREFERENCES_KEY = "swt.pref.dashboard";

type DashboardPreferencesFile = PersistedPreferenceSection<DashboardPreferences>;

export function loadDashboardPreferences(): DashboardPreferences {
  if (typeof window === "undefined") return defaultDashboardPreferences;

  try {
    const raw = window.localStorage.getItem(DASHBOARD_PREFERENCES_KEY);
    if (!raw) return defaultDashboardPreferences;

    const parsed = JSON.parse(raw) as unknown;
    if (!isDashboardPreferencesFile(parsed)) return defaultDashboardPreferences;

    return {
      ...defaultDashboardPreferences,
      ...parsed.data,
    };
  } catch {
    return defaultDashboardPreferences;
  }
}

export function saveDashboardPreferences(preferences: DashboardPreferences): void {
  if (typeof window === "undefined") return;

  const file: DashboardPreferencesFile = {
    version: 1,
    data: preferences,
  };

  window.localStorage.setItem(DASHBOARD_PREFERENCES_KEY, JSON.stringify(file));
}

function isDashboardPreferencesFile(value: unknown): value is DashboardPreferencesFile {
  if (!value || typeof value !== "object") return false;

  const file = value as Record<string, unknown>;
  return file.version === 1 && isDashboardPreferences(file.data);
}

function isDashboardPreferences(value: unknown): value is DashboardPreferences {
  if (!value || typeof value !== "object") return false;

  const preferences = value as Record<string, unknown>;
  return (
    isDashboardMode(preferences.progressMode) &&
    isDashboardMode(preferences.trendModePreference) &&
    isTrendRange(preferences.trendRange)
  );
}

function isDashboardMode(value: unknown): value is DashboardMode {
  return value === "phase" || value === "full";
}

function isTrendRange(value: unknown): value is TrendRange {
  return value === "10d" || value === "1m" || value === "3m" || value === "6m" || value === "1y" || value === "all";
}
