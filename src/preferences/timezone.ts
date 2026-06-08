import type { TimezonePreference } from "@/preferences/types";

type SupportedValuesOf = {
  supportedValuesOf?: (key: "timeZone") => string[];
};

export function getBrowserTimezone(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimezone(timezone) ? timezone : "UTC";
}

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getEffectiveTimezone(preference: TimezonePreference): string {
  if (preference.mode === "fixed" && isValidTimezone(preference.timezone)) {
    return preference.timezone;
  }

  return getBrowserTimezone();
}

export function getLocalDateInTimezone(timezone: string, date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function listSupportedTimezones(): string[] {
  const intlWithSupportedValues = Intl as typeof Intl & SupportedValuesOf;
  return intlWithSupportedValues.supportedValuesOf?.("timeZone") ?? [getBrowserTimezone()];
}
