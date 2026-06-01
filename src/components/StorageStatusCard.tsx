import { Block, BlockTitle, Button, List, ListItem } from "framework7-react";
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
    <>
      <BlockTitle>Data safety</BlockTitle>
      <List strongIos dividersIos insetIos>
        <ListItem title="Run mode" after={standalone ? "Home Screen PWA" : "Safari tab / browser"} />
        <ListItem title="Persistent storage" after={status?.persisted ? "Enabled" : status?.supported ? "Not enabled" : "Not supported"} />
        <ListItem title="Usage" after={formatBytes(status?.usage ?? null)} />
        <ListItem title="Quota" after={formatBytes(status?.quota ?? null)} />
      </List>
      {!standalone ? <Block strong inset className="warning-block">For real use, add this app to the iPhone Home Screen and open it from there.</Block> : null}
      {!status?.persisted ? <Block strong inset className="warning-block">Persistent storage is not active. Export JSON backups before changing device, deleting the app, or clearing website data.</Block> : null}
      <Block inset>
        <Button fill large type="button" onClick={onRequest}>Check / request persistent storage</Button>
      </Block>
    </>
  );
}
