import type { StoragePersistenceStatus } from "../pwa/storagePersistence";

type Props = {
  standalone: boolean;
  status: StoragePersistenceStatus | null;
  onRequest: () => Promise<void>;
};

function formatBytes(value: number | null) {
  if (value === null) return "unknown";
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function StorageStatusCard({ standalone, status, onRequest }: Props) {
  return (
    <section className="card">
      <h2>Data safety</h2>
      <dl className="status-grid">
        <dt>Run mode</dt>
        <dd>{standalone ? "Home Screen PWA" : "Safari tab / browser"}</dd>
        <dt>Persistent storage</dt>
        <dd>{status?.persisted ? "Enabled" : status?.supported ? "Not enabled" : "Not supported"}</dd>
        <dt>Usage</dt>
        <dd>{formatBytes(status?.usage ?? null)}</dd>
        <dt>Quota</dt>
        <dd>{formatBytes(status?.quota ?? null)}</dd>
      </dl>
      {!standalone ? <p className="warning">For real use, add this app to the iPhone Home Screen and open it from there.</p> : null}
      {!status?.persisted ? <p className="warning">Persistent storage is not active. Export JSON backups before changing device, deleting the app, or clearing website data.</p> : null}
      <button type="button" onClick={onRequest}>Check / request persistent storage</button>
    </section>
  );
}
