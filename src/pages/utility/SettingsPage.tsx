import { useMemo, useRef, useState } from "react";
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
  onBack: () => void;
  onChangeTimezonePreference: (preference: TimezonePreference) => void;
};

export function SettingsPage({ timezonePreference, onBack, onChangeTimezonePreference }: Props) {
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

    setApplyError("Select an option from the dropdown or enter an exact city, timezone name, IANA timezone, or UTC offset.");
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

  return (
    <>
      <PageHeaderRow leftAction={{ kind: "back", onClick: onBack }} />
      <section className="card settings-card">
        <h2>Settings</h2>
        <div className="settings-section">
          <div>
            <h3>Date and Time</h3>
            <p className="muted">
              This controls when the app considers a new local day to begin. It stays on this browser/device and is not included in backup import or export.
            </p>
          </div>

          <label>
            Timezone mode
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
              <option value="auto">Use device timezone</option>
              <option value="fixed">Use fixed timezone</option>
            </select>
          </label>

          <dl className="status-grid">
            <dt>Current device timezone</dt>
            <dd>{browserTimezone}</dd>
            <dt>Effective timezone</dt>
            <dd>{effectiveTimezone}</dd>
          </dl>

          {timezonePreference.mode === "fixed" ? (
            <label>
              Fixed timezone
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
                  placeholder="Shanghai, Pacific Time, America/Toronto, UTC+8"
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
              <span className="muted">Accepted exact forms: city name, timezone name, IANA timezone, or UTC offset.</span>
              <button type="button" className="secondary" onClick={commitDraftTimezone} disabled={draftTimezone.trim().length === 0}>
                Apply timezone
              </button>
            </label>
          ) : null}

          {applyError ? <p className="form-error">{applyError}</p> : null}
        </div>
      </section>
    </>
  );
}
