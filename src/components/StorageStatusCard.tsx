import { useTranslation } from "@/i18n";
import type { StoragePersistenceStatus } from "@/pwa/storagePersistence";

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
  const { t } = useTranslation();

  return (
    <section className="card">
      <h2>{t("dataSafety.title")}</h2>
      <dl className="status-grid">
        <dt>{t("dataSafety.runMode")}</dt>
        <dd>{standalone ? t("dataSafety.pwa") : t("dataSafety.browser")}</dd>
        <dt>{t("dataSafety.persistentStorage")}</dt>
        <dd>{status?.persisted ? t("dataSafety.enabled") : status?.supported ? t("dataSafety.notEnabled") : t("dataSafety.notSupported")}</dd>
        <dt>{t("dataSafety.usage")}</dt>
        <dd>{formatBytes(status?.usage ?? null)}</dd>
        <dt>{t("dataSafety.quota")}</dt>
        <dd>{formatBytes(status?.quota ?? null)}</dd>
      </dl>
      {!standalone ? <p className="warning">{t("dataSafety.addToHomeScreen")}</p> : null}
      {!status?.persisted ? <p className="warning">{t("dataSafety.persistenceWarning")}</p> : null}
      <button type="button" onClick={onRequest}>{t("dataSafety.checkPersist")}</button>
    </section>
  );
}
