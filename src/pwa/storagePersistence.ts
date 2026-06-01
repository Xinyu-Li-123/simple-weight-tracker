export type StoragePersistenceStatus = {
  supported: boolean;
  persisted: boolean;
  quota: number | null;
  usage: number | null;
};

export async function getStoragePersistenceStatus(): Promise<StoragePersistenceStatus> {
  const storage = navigator.storage;

  if (!storage) {
    return { supported: false, persisted: false, quota: null, usage: null };
  }

  const [persisted, estimate] = await Promise.all([
    storage.persisted ? storage.persisted() : Promise.resolve(false),
    storage.estimate ? storage.estimate() : Promise.resolve(null),
  ]);

  return {
    supported: Boolean(storage.persist && storage.persisted),
    persisted,
    quota: estimate?.quota ?? null,
    usage: estimate?.usage ?? null,
  };
}

export async function requestPersistentStorage(): Promise<StoragePersistenceStatus> {
  const storage = navigator.storage;

  if (!storage?.persist || !storage.persisted) {
    return getStoragePersistenceStatus();
  }

  const alreadyPersisted = await storage.persisted();
  if (!alreadyPersisted) {
    await storage.persist();
  }

  return getStoragePersistenceStatus();
}
