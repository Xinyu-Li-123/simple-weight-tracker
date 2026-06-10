import type { Locale } from "date-fns/locale";
import { enUS } from "date-fns/locale/en-US";
import { zhCN } from "date-fns/locale/zh-CN";

export interface LanguageConfig {
  code: string;
  label: string;
  dateFnsLocale: Locale;
  intlLocale?: string;
  detectionTags?: string[];
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: "en",
    label: "English",
    dateFnsLocale: enUS,
  },
  {
    code: "zh-Hans",
    label: "简体中文",
    dateFnsLocale: zhCN,
    intlLocale: "zh-Hans-CN",
    detectionTags: ["zh-CN", "zh-SG", "zh"],
  },
];

export const DEFAULT_LANGUAGE = "en";

export function isValidLanguage(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

export function getLanguageConfig(code: string): LanguageConfig | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}
