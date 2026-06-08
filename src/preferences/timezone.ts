import { rawTimeZones } from "@vvo/tzdb";
import type { FixedTimezonePreference, FixedUtcOffsetTimezonePreference, TimezonePreference } from "@/preferences/types";

type ParsedTimezoneInput =
  | {
      ok: true;
      preference: FixedTimezonePreference;
      description: string;
    }
  | {
      ok: false;
      description: string;
    };

type ExactLookup = Map<string, string | null>;
export type TimezoneSuggestionCategory = "city" | "timezone_name" | "iana" | "utc_offset";

export type TimezoneSuggestion = {
  id: string;
  label: string;
  inputValue: string;
  detail: string;
  category: TimezoneSuggestionCategory;
  preference: FixedTimezonePreference;
  searchKeys: string[];
};

const UTC_OFFSET_PATTERN = /^(?:utc|gmt)(?:(?<sign>[+-])(?<hours>\d{1,2})(?::?(?<minutes>\d{2}))?)?$/iu;
const ianaLookup = buildLookup(rawTimeZones.map((timeZone) => [timeZone.name, timeZone.name] as const));
const alternativeNameLookup = buildLookup(rawTimeZones.map((timeZone) => [timeZone.alternativeName, timeZone.name] as const));
const cityLookup = buildLookup(
  rawTimeZones.flatMap((timeZone) => timeZone.mainCities.map((city) => [city, timeZone.name] as const)),
);
const timezoneSuggestions = buildTimezoneSuggestions();

export function getBrowserTimezone(): string {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimezone(timezone) ? timezone : "UTC";
}

export function normalizeTimezonePreference(value: unknown): TimezonePreference | null {
  if (!value || typeof value !== "object") return null;

  const preference = value as Record<string, unknown>;
  if (preference.mode === "auto") {
    return { mode: "auto" };
  }

  if (preference.mode !== "fixed") return null;

  if (preference.kind === "iana" && typeof preference.timezone === "string" && isValidTimezone(preference.timezone)) {
    return {
      mode: "fixed",
      kind: "iana",
      timezone: preference.timezone,
    };
  }

  if (
    preference.kind === "utc_offset" &&
    typeof preference.offsetMinutes === "number" &&
    Number.isInteger(preference.offsetMinutes) &&
    isValidUtcOffset(preference.offsetMinutes)
  ) {
    return {
      mode: "fixed",
      kind: "utc_offset",
      offsetMinutes: preference.offsetMinutes,
      label: typeof preference.label === "string" && preference.label.length > 0 ? preference.label : formatUtcOffset(preference.offsetMinutes),
    };
  }

  if (typeof preference.timezone === "string" && isValidTimezone(preference.timezone)) {
    return {
      mode: "fixed",
      kind: "iana",
      timezone: preference.timezone,
    };
  }

  return null;
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
  if (preference.mode === "fixed" && preference.kind === "iana" && isValidTimezone(preference.timezone)) {
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

export function getLocalDateForTimezonePreference(preference: TimezonePreference, date = new Date()): string {
  if (preference.mode === "auto") {
    return getLocalDateInTimezone(getBrowserTimezone(), date);
  }

  if (preference.kind === "iana") {
    return getLocalDateInTimezone(preference.timezone, date);
  }

  return getLocalDateInUtcOffset(preference.offsetMinutes, date);
}

export function getTimezoneDisplayName(preference: TimezonePreference): string {
  if (preference.mode === "auto") return getBrowserTimezone();
  if (preference.kind === "iana") return preference.timezone;
  return preference.label;
}

export function getTimezoneSuggestions(input: string, limit = 8): TimezoneSuggestion[] {
  const normalizedInput = normalizeLookupKey(input);
  if (!normalizedInput) return [];

  return timezoneSuggestions
    .filter((suggestion) => suggestion.searchKeys.some((searchKey) => searchKey.startsWith(normalizedInput)))
    .slice(0, limit);
}

export function parseTimezoneInput(input: string): ParsedTimezoneInput {
  const normalizedInput = normalizeLookupKey(input);
  if (!normalizedInput) {
    return {
      ok: false,
      description: "Enter an exact city name, timezone name, IANA timezone, or UTC offset.",
    };
  }

  const utcOffsetPreference = parseUtcOffsetInput(input);
  if (utcOffsetPreference) {
    return {
      ok: true,
      preference: utcOffsetPreference,
      description: `${utcOffsetPreference.label} fixed offset. No daylight saving time changes.`,
    };
  }

  const ianaMatch = resolveLookupMatch(ianaLookup, normalizedInput);
  if (ianaMatch.ok) {
    return {
      ok: true,
      preference: {
        mode: "fixed",
        kind: "iana",
        timezone: ianaMatch.timezone,
      },
      description: `Will use ${ianaMatch.timezone}.`,
    };
  }
  if (ianaMatch.description) return ianaMatch;

  const alternativeNameMatch = resolveLookupMatch(alternativeNameLookup, normalizedInput);
  if (alternativeNameMatch.ok) {
    return {
      ok: true,
      preference: {
        mode: "fixed",
        kind: "iana",
        timezone: alternativeNameMatch.timezone,
      },
      description: `Will use ${alternativeNameMatch.timezone}.`,
    };
  }
  if (alternativeNameMatch.description) return alternativeNameMatch;

  const cityMatch = resolveLookupMatch(cityLookup, normalizedInput);
  if (cityMatch.ok) {
    return {
      ok: true,
      preference: {
        mode: "fixed",
        kind: "iana",
        timezone: cityMatch.timezone,
      },
      description: `Will use ${cityMatch.timezone}.`,
    };
  }
  if (cityMatch.description) return cityMatch;

  return {
    ok: false,
    description: "No exact match found. Try a city like Shanghai, a timezone like Pacific Time, an IANA name, or UTC+8.",
  };
}

function getLocalDateInUtcOffset(offsetMinutes: number, date: Date): string {
  const shiftedDate = new Date(date.getTime() + offsetMinutes * 60_000);
  const year = shiftedDate.getUTCFullYear();
  const month = String(shiftedDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shiftedDate.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseUtcOffsetInput(input: string): FixedUtcOffsetTimezonePreference | null {
  const match = input.trim().match(UTC_OFFSET_PATTERN);
  if (!match?.groups) return null;

  const sign = match.groups.sign;
  const hoursText = match.groups.hours;
  const minutesText = match.groups.minutes;

  if (!sign && !hoursText && !minutesText) {
    return {
      mode: "fixed",
      kind: "utc_offset",
      offsetMinutes: 0,
      label: "UTC",
    };
  }

  if (!sign || !hoursText) return null;

  const hours = Number(hoursText);
  const minutes = minutesText ? Number(minutesText) : 0;
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || minutes >= 60) return null;

  const totalMinutes = hours * 60 + minutes;
  const signedOffset = sign === "-" ? -totalMinutes : totalMinutes;
  if (!isValidUtcOffset(signedOffset)) return null;

  return {
    mode: "fixed",
    kind: "utc_offset",
    offsetMinutes: signedOffset,
    label: formatUtcOffset(signedOffset),
  };
}

function formatUtcOffset(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "UTC";

  const sign = offsetMinutes < 0 ? "-" : "+";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");
  return `UTC${sign}${hours}:${minutes}`;
}

function isValidUtcOffset(offsetMinutes: number): boolean {
  return Math.abs(offsetMinutes) <= 14 * 60;
}

function buildLookup(entries: ReadonlyArray<readonly [string, string]>): ExactLookup {
  const lookup = new Map<string, string | null>();

  for (const [rawKey, value] of entries) {
    const key = normalizeLookupKey(rawKey);
    if (!key) continue;

    const existing = lookup.get(key);
    if (existing === undefined) {
      lookup.set(key, value);
      continue;
    }

    if (existing !== value) {
      lookup.set(key, null);
    }
  }

  return lookup;
}

function resolveLookupMatch(
  lookup: ExactLookup,
  key: string,
): { ok: true; timezone: string } | { ok: false; description: string } {
  if (!lookup.has(key)) {
    return { ok: false, description: "" };
  }

  const match = lookup.get(key) as string | undefined;
  if (match === undefined || match === null) {
    if (match === undefined) {
      return { ok: false, description: "" };
    }
    return {
      ok: false,
      description: "That input matches multiple timezones. Please use a more specific city or an IANA timezone name.",
    };
  }

  return {
    ok: true,
    timezone: match,
  };
}

function normalizeLookupKey(value: string): string {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase();
}

function buildTimezoneSuggestions(): TimezoneSuggestion[] {
  const suggestions: TimezoneSuggestion[] = [];
  const seen = new Set<string>();

  for (const timeZone of rawTimeZones) {
    suggestions.push({
      id: `iana:${timeZone.name}`,
      label: timeZone.name,
      inputValue: timeZone.name,
      detail: `${timeZone.alternativeName} • ${timeZone.countryName}`,
      category: "iana",
      preference: {
        mode: "fixed",
        kind: "iana",
        timezone: timeZone.name,
      },
      searchKeys: [normalizeLookupKey(timeZone.name)],
    });

    const alternativeNameKey = `timezone_name:${timeZone.alternativeName}:${timeZone.name}`;
    if (!seen.has(alternativeNameKey)) {
      seen.add(alternativeNameKey);
      suggestions.push({
        id: alternativeNameKey,
        label: timeZone.alternativeName,
        inputValue: timeZone.alternativeName,
        detail: `${timeZone.name} • ${timeZone.countryName}`,
        category: "timezone_name",
        preference: {
          mode: "fixed",
          kind: "iana",
          timezone: timeZone.name,
        },
        searchKeys: [normalizeLookupKey(timeZone.alternativeName)],
      });
    }

    for (const city of timeZone.mainCities) {
      const cityKey = `city:${city}:${timeZone.name}`;
      if (seen.has(cityKey)) continue;
      seen.add(cityKey);
      suggestions.push({
        id: cityKey,
        label: city,
        inputValue: city,
        detail: `${timeZone.name} • ${timeZone.countryName}`,
        category: "city",
        preference: {
          mode: "fixed",
          kind: "iana",
          timezone: timeZone.name,
        },
        searchKeys: [normalizeLookupKey(city)],
      });
    }
  }

  for (const offsetMinutes of generateUtcOffsetMinutes()) {
    const label = formatUtcOffset(offsetMinutes);
    suggestions.push({
      id: `utc_offset:${label}`,
      label,
      inputValue: label,
      detail: "Fixed offset, no daylight saving time",
      category: "utc_offset",
      preference: {
        mode: "fixed",
        kind: "utc_offset",
        offsetMinutes,
        label,
      },
      searchKeys: buildUtcSearchKeys(offsetMinutes).map(normalizeLookupKey),
    });
  }

  return suggestions.sort((left, right) => {
    const categoryOrder = getSuggestionCategoryOrder(left.category) - getSuggestionCategoryOrder(right.category);
    if (categoryOrder !== 0) return categoryOrder;
    if (left.label.length !== right.label.length) return left.label.length - right.label.length;
    return left.label.localeCompare(right.label);
  });
}

function generateUtcOffsetMinutes(): number[] {
  const offsets: number[] = [];

  for (let offsetMinutes = -12 * 60; offsetMinutes <= 14 * 60; offsetMinutes += 15) {
    offsets.push(offsetMinutes);
  }

  return offsets;
}

function buildUtcSearchKeys(offsetMinutes: number): string[] {
  const sign = offsetMinutes < 0 ? "-" : "+";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const minutes = absoluteMinutes % 60;
  const paddedHours = String(hours).padStart(2, "0");
  const paddedMinutes = String(minutes).padStart(2, "0");

  if (offsetMinutes === 0) {
    return ["UTC", "GMT"];
  }

  const keys = new Set<string>([
    `UTC${sign}${hours}`,
    `UTC${sign}${paddedHours}`,
    `UTC${sign}${paddedHours}:${paddedMinutes}`,
    `GMT${sign}${hours}`,
    `GMT${sign}${paddedHours}`,
    `GMT${sign}${paddedHours}:${paddedMinutes}`,
  ]);

  if (minutes !== 0) {
    keys.add(`UTC${sign}${hours}:${paddedMinutes}`);
    keys.add(`GMT${sign}${hours}:${paddedMinutes}`);
  }

  return [...keys];
}

function getSuggestionCategoryOrder(category: TimezoneSuggestionCategory): number {
  if (category === "city") return 0;
  if (category === "timezone_name") return 1;
  if (category === "iana") return 2;
  return 3;
}
