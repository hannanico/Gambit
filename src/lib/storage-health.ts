export type StorageHealth = {
  usage: number;
  quota: number;
  persistent: boolean | null;
};

export async function requestPersistentStorage(): Promise<boolean | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) {
    return null;
  }

  try {
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}

export async function getStorageHealth(): Promise<StorageHealth | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) {
    return null;
  }

  try {
    const [estimate, persistent] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted?.() ?? Promise.resolve(null),
    ]);

    return {
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
      persistent,
    };
  } catch {
    return null;
  }
}

export function formatStorageSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}