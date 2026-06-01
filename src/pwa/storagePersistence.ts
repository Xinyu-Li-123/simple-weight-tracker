export type StoragePersistenceStatus = {
  supported: boolean;
  persisted: boolean;
  quota: number | null;
  usage: number | null;
};

export async function getStoragePersistenceStatus(): Promise<StoragePersistenceStatus> {
  const storage = navigator.storage;

  if (!storage) {
    return {
      supported: false,
      persisted: false,
      quota: null,
      usage: null,
    };
  }

  const persistSupported =
    typeof (storage as Partial<StorageManager>).persist === "function" &&
    typeof (storage as Partial<StorageManager>).persisted === "function";

  const [persisted, estimate] = await Promise.all([
    persistSupported ? storage.persisted() : Promise.resolve(false),
    storage.estimate ? storage.estimate() : Promise.resolve(null),
  ]);

  return {
    supported: persistSupported,
    persisted,
    quota: estimate?.quota ?? null,
    usage: estimate?.usage ?? null,
  };
}

export async function requestPersistentStorage(): Promise<StoragePersistenceStatus> {
  const storage = navigator.storage;

  if (!storage) {
    return getStoragePersistenceStatus();
  }

  const persistSupported =
    typeof (storage as Partial<StorageManager>).persist === "function" &&
    typeof (storage as Partial<StorageManager>).persisted === "function";

  if (!persistSupported) {
    return getStoragePersistenceStatus();
  }

  const alreadyPersisted = await storage.persisted();

  if (!alreadyPersisted) {
    await storage.persist();
  }

  return getStoragePersistenceStatus();
}
