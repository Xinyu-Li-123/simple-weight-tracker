import { useMemo, useRef, useState } from "react";
import { useTranslation } from "@/i18n";
import { SUPPORTED_LANGUAGES } from "@/i18n/languages";
import { PageHeaderRow } from "@/components/navigation/PageHeaderRow";
import {
  getBrowserTimezone,
  getTimezoneDisplayName,
  getTimezoneSuggestions,
  parseTimezoneInput,
  type TimezoneSuggestion,
} from "@/preferences/timezone";
import type { TimezonePreference } from "@/preferences/types";

type Props = {
  timezonePreference: TimezonePreference;
  language: string;
  onBack: () => void;
  onChangeTimezonePreference: (preference: TimezonePreference) => void;
  onChangeLanguage: (language: string) => void;
};

export function SettingsPage({
  timezonePreference,
  language,
  onBack,
  onChangeTimezonePreference,
  onChangeLanguage,
}: Props) {
  const { t, i18n } = useTranslation();
  const browserTimezone = getBrowserTimezone();
  const effectiveTimezone = getTimezoneDisplayName(timezonePreference);
  const [draftTimezone, setDraftTimezone] = useState(getTimezoneDisplayName(timezonePreference));
  const [selectedSuggestion, setSelectedSuggestion] = useState<TimezoneSuggestion | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const blurTimeoutRef = useRef<number | null>(null);
  const suggestions = useMemo(() => getTimezoneSuggestions(draftTimezone), [draftTimezone]);
  const timezoneInputResult = timezonePreference.mode === "fixed" ? parseTimezoneInput(draftTimezone) : null;

  function commitDraftTimezone() {
    if (timezoneInputResult?.ok) {
      onChangeTimezonePreference(timezoneInputResult.preference);
      setApplyError(null);
      setSelectedSuggestion(null);
      setDropdownOpen(false);
      return;
    }

    if (selectedSuggestion) {
      onChangeTimezonePreference(selectedSuggestion.preference);
      setDraftTimezone(selectedSuggestion.inputValue);
      setApplyError(null);
      setSelectedSuggestion(null);
      setDropdownOpen(false);
      return;
    }

    setApplyError(t("settings.selectFromDropdown"));
  }

  function handleSelectSuggestion(suggestion: TimezoneSuggestion) {
    setDraftTimezone(suggestion.inputValue);
    setSelectedSuggestion(suggestion);
    setApplyError(null);
    setDropdownOpen(false);
  }

  function clearPendingValidation() {
    setApplyError(null);
    setSelectedSuggestion(null);
  }

  function handleInputBlur() {
    blurTimeoutRef.current = window.setTimeout(() => {
      setDropdownOpen(false);
    }, 100);
  }

  function handleInputFocus() {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setDropdownOpen(true);
  }

  function handleLanguageChange(code: string) {
    onChangeLanguage(code);
    void i18n.changeLanguage(code);
  }

  return (
    <>
      <PageHeaderRow leftAction={{ kind: "back", onClick: onBack }} />
      <section className="card settings-card">
        <h2>{t("settings.title")}</h2>

        <div className="settings-section">
          <div>
            <h3>{t("settings.language")}</h3>
          </div>
          <label>
            <select
              value={language}
              onChange={(event) => handleLanguageChange(event.target.value)}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="settings-section">
          <div>
            <h3>{t("settings.dateTime")}</h3>
            <p className="muted">
              {t("settings.dateTimeDesc")}
            </p>
          </div>

          <label>
            {t("settings.timezoneMode")}
            <select
              value={timezonePreference.mode}
              onChange={(event) => {
                if (event.target.value === "fixed") {
                  setDraftTimezone(browserTimezone);
                  setSelectedSuggestion(null);
                  setApplyError(null);
                  onChangeTimezonePreference({ mode: "fixed", kind: "iana", timezone: browserTimezone });
                  return;
                }

                setApplyError(null);
                setSelectedSuggestion(null);
                setDropdownOpen(false);
                onChangeTimezonePreference({ mode: "auto" });
              }}
            >
              <option value="auto">{t("settings.useDevice")}</option>
              <option value="fixed">{t("settings.useFixed")}</option>
            </select>
          </label>

          <dl className="status-grid">
            <dt>{t("settings.currentDevice")}</dt>
            <dd>{browserTimezone}</dd>
            <dt>{t("settings.effectiveTimezone")}</dt>
            <dd>{effectiveTimezone}</dd>
          </dl>

          {timezonePreference.mode === "fixed" ? (
            <label>
              {t("settings.fixedTimezone")}
              <div className="settings-combobox">
                <input
                  value={draftTimezone}
                  onChange={(event) => {
                    clearPendingValidation();
                    setDraftTimezone(event.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder={t("settings.fixedPlaceholder")}
                  aria-invalid={applyError ? true : undefined}
                />
                {dropdownOpen && suggestions.length > 0 ? (
                  <div className="settings-combobox__menu" role="listbox" aria-label="Timezone suggestions">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        className={selectedSuggestion?.id === suggestion.id ? "settings-combobox__option settings-combobox__option--selected" : "settings-combobox__option"}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleSelectSuggestion(suggestion);
                        }}
                      >
                        <span className="settings-combobox__option-label">{suggestion.label}</span>
                        <span className="settings-combobox__option-detail">{suggestion.detail}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <span className="muted">{t("settings.fixedHint")}</span>
              <button type="button" className="secondary" onClick={commitDraftTimezone} disabled={draftTimezone.trim().length === 0}>
                {t("settings.applyTimezone")}
              </button>
            </label>
          ) : null}

          {applyError ? <p className="form-error">{applyError}</p> : null}
        </div>
      </section>
    </>
  );
}
