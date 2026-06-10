import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  DEFAULT_LANGUAGE,
  isValidLanguage,
  SUPPORTED_LANGUAGES,
} from "@/i18n/languages";
import en from "./locales/en.json";
import zhHans from "./locales/zh-Hans.json";

function detectInitialLanguage(): string {
  try {
    const raw = localStorage.getItem("swt.pref.app");
    if (raw) {
      const pref = JSON.parse(raw);
      if (typeof pref.data?.language === "string" && isValidLanguage(pref.data.language)) {
        return pref.data.language;
      }
    }
  } catch {
    /* fall through to browser detection */
  }

  const browser = navigator.language;

  const exact = SUPPORTED_LANGUAGES.find((lang) => lang.code === browser);
  if (exact) return exact.code;

  const byDetectionTag = SUPPORTED_LANGUAGES.find(
    (lang) => lang.detectionTags?.includes(browser),
  );
  if (byDetectionTag) return byDetectionTag.code;

  const prefix = browser.split("-")[0];
  const byPrefix = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code.startsWith(prefix),
  );
  if (byPrefix) return byPrefix.code;

  return DEFAULT_LANGUAGE;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "zh-Hans": { translation: zhHans },
  },
  lng: detectInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
  returnNull: false,
});

export { i18n };
export { useTranslation } from "react-i18next";

export function tUnsafe(key: string, options?: Record<string, unknown>): string {
  return (i18n.t as (key: string, options?: Record<string, unknown>) => string)(key, options);
}

export function existsUnsafe(key: string): boolean {
  return (i18n.exists as (key: string) => boolean)(key);
}
