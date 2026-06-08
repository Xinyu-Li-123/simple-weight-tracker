import type { TrendRange } from "@/domain/weightStats";
import {
  defaultAppPreferences,
  defaultDashboardPreferences,
  defaultHistoryPreferences,
  type AppPreferences,
  type DashboardMode,
  type DashboardPreferences,
  type HistoryViewId,
  type HistoryPreferences,
  type PersistedPreferenceSection,
} from "@/preferences/types";
import { normalizeTimezonePreference } from "@/preferences/timezone";

const APP_PREFERENCES_KEY = "swt.pref.app";
const LEGACY_DASHBOARD_PREFERENCES_KEY = "swt.pref.dashboard";

type AppPreferencesFile = PersistedPreferenceSection<AppPreferences>;
type LegacyDashboardPreferencesFile = PersistedPreferenceSection<DashboardPreferences>;

export function loadAppPreferences(): AppPreferences {
  if (typeof window === "undefined") return defaultAppPreferences;

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (isAppPreferencesFile(parsed)) {
        const timezone = normalizeTimezonePreference(parsed.data.timezone);
        if (!timezone) return defaultAppPreferences;

        return {
          dashboard: {
            ...defaultDashboardPreferences,
            ...parsed.data.dashboard,
          },
          history: {
            ...defaultHistoryPreferences,
            ...parsed.data.history,
          },
          timezone,
        };
      }
    }

    const legacyRaw = window.localStorage.getItem(LEGACY_DASHBOARD_PREFERENCES_KEY);
    if (!legacyRaw) return defaultAppPreferences;

    const legacyParsed = JSON.parse(legacyRaw) as unknown;
    if (!isLegacyDashboardPreferencesFile(legacyParsed)) return defaultAppPreferences;

    return {
      dashboard: {
        ...defaultDashboardPreferences,
        ...legacyParsed.data,
      },
      history: defaultHistoryPreferences,
      timezone: defaultAppPreferences.timezone,
    };
  } catch {
    return defaultAppPreferences;
  }
}

export function saveAppPreferences(preferences: AppPreferences): void {
  if (typeof window === "undefined") return;

  const file: AppPreferencesFile = {
    version: 1,
    data: preferences,
  };

  window.localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(file));
}

function isAppPreferencesFile(value: unknown): value is AppPreferencesFile {
  if (!value || typeof value !== "object") return false;

  const file = value as Record<string, unknown>;
  return file.version === 1 && isAppPreferences(file.data);
}

function isLegacyDashboardPreferencesFile(value: unknown): value is LegacyDashboardPreferencesFile {
  if (!value || typeof value !== "object") return false;

  const file = value as Record<string, unknown>;
  return file.version === 1 && isDashboardPreferences(file.data);
}

function isAppPreferences(value: unknown): value is AppPreferences {
  if (!value || typeof value !== "object") return false;

  const preferences = value as Record<string, unknown>;
  return isDashboardPreferences(preferences.dashboard) && isHistoryPreferences(preferences.history) && normalizeTimezonePreference(preferences.timezone) !== null;
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

function isHistoryViewId(value: unknown): value is HistoryViewId {
  return value === "list-compact" || value === "list-expanded" || value === "calendar-week" || value === "calendar-month";
}

function isHistoryPreferences(value: unknown): value is HistoryPreferences {
  if (!value || typeof value !== "object") return false;

  const preferences = value as Record<string, unknown>;
  return isHistoryViewId(preferences.historyView);
}
