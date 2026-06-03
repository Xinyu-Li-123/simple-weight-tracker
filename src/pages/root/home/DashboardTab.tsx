import { WeightList } from "../../../components/WeightList";
import { useToast } from "../../../toast/useToast";
import type { WeightEntry } from "../../../types/weight";

type Props = {
  entries: WeightEntry[];
  standalone: boolean;
  onDelete: (id: string) => Promise<void>;
};

export function DashboardTab({ entries, standalone, onDelete }: Props) {
  const { pushToast } = useToast();
  const recentEntries = entries.slice(0, 3);

  return (
    <>
      {!standalone ? (
        <section className="warning storage-warning">
          <div>
            <strong>Use this app from your Home Screen for real use.</strong>
            <p>iPhone: open in Safari, tap Share, then Add to Home Screen.</p>
            <p>Android: open the browser menu, then Install app or Add to Home screen.</p>
          </div>
        </section>
      ) : null}
      <section className="card summary-placeholder">
        <h2>Summary</h2>
        <p className="muted">Visualization placeholder. A chart or trend summary will live here in a later slice.</p>
      </section>
      <WeightList entries={recentEntries} onDelete={onDelete} />
      <section className="card testing-panel">
        <h2>Testing</h2>
        <section className="testing-panel__section" aria-labelledby="testing-toast-types">
          <h3 id="testing-toast-types">Toast Types</h3>
          <div className="testing-panel__actions">
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Informational toast", variant: "info" })}>
              Info
            </button>
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Success toast", variant: "success" })}>
              Success
            </button>
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Warning toast", variant: "warning" })}>
              Warning
            </button>
            <button type="button" className="secondary testing-panel__button" onClick={() => pushToast({ message: "Error toast", variant: "error" })}>
              Error
            </button>
          </div>
        </section>
      </section>
    </>
  );
}
