import { useMemo, useState } from "react";
import { PageHeaderRow } from "@/components/navigation/PageHeaderRow";
import { getBrowserTimezone, getEffectiveTimezone, isValidTimezone, listSupportedTimezones } from "@/preferences/timezone";
import type { TimezonePreference } from "@/preferences/types";

type Props = {
  timezonePreference: TimezonePreference;
  onBack: () => void;
  onChangeTimezonePreference: (preference: TimezonePreference) => void;
};

export function SettingsPage({ timezonePreference, onBack, onChangeTimezonePreference }: Props) {
  const browserTimezone = getBrowserTimezone();
  const effectiveTimezone = getEffectiveTimezone(timezonePreference);
  const timezoneOptions = useMemo(() => listSupportedTimezones(), []);
  const [draftTimezone, setDraftTimezone] = useState(timezonePreference.mode === "fixed" ? timezonePreference.timezone : effectiveTimezone);
  const timezoneInputInvalid = timezonePreference.mode === "fixed" && draftTimezone.trim().length > 0 && !isValidTimezone(draftTimezone.trim());

  function commitDraftTimezone() {
    const trimmedTimezone = draftTimezone.trim();
    if (!trimmedTimezone || !isValidTimezone(trimmedTimezone)) return;
    onChangeTimezonePreference({ mode: "fixed", timezone: trimmedTimezone });
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
                  setDraftTimezone(effectiveTimezone);
                  onChangeTimezonePreference({ mode: "fixed", timezone: effectiveTimezone });
                  return;
                }

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
              <input
                list="timezone-options"
                value={draftTimezone}
                onChange={(event) => setDraftTimezone(event.target.value)}
                onBlur={commitDraftTimezone}
                placeholder="America/Toronto"
                aria-invalid={timezoneInputInvalid}
              />
              <datalist id="timezone-options">
                {timezoneOptions.map((timezone) => (
                  <option key={timezone} value={timezone} />
                ))}
              </datalist>
              <button type="button" className="secondary" onClick={commitDraftTimezone} disabled={timezoneInputInvalid || draftTimezone.trim().length === 0}>
                Apply timezone
              </button>
            </label>
          ) : null}

          {timezoneInputInvalid ? <p className="form-error">Enter a valid IANA timezone such as America/Toronto.</p> : null}
        </div>
      </section>
    </>
  );
}
