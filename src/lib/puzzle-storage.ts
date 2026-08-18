import type { Puzzle, PuzzlePack } from "@/types/puzzle";

const DATABASE_NAME = "gambit";
const DATABASE_VERSION = 2;
const PACK_STORE = "puzzle-packs";

export type StoredPuzzlePack = {
  id: string;
  downloadedAt: number;
  pack: PuzzlePack;
  puzzles: Puzzle[];
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(PACK_STORE)) {
        database.createObjectStore(PACK_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePuzzlePack(
  pack: PuzzlePack,
  puzzles: Puzzle[],
): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PACK_STORE, "readwrite");

    transaction.objectStore(PACK_STORE).put({
      id: pack.id,
      downloadedAt: Date.now(),
      pack,
      puzzles,
    } satisfies StoredPuzzlePack);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

export async function getPuzzlePack(
  packId: string,
): Promise<StoredPuzzlePack | null> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PACK_STORE, "readonly");
    const request = transaction.objectStore(PACK_STORE).get(packId);

    request.onsuccess = () => {
      database.close();
      resolve((request.result as StoredPuzzlePack | undefined) ?? null);
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function getDownloadedPackIds(): Promise<string[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PACK_STORE, "readonly");
    const request = transaction.objectStore(PACK_STORE).getAllKeys();

    request.onsuccess = () => {
      database.close();
      resolve(request.result.map(String));
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function getDownloadedPuzzlePacks(): Promise<StoredPuzzlePack[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PACK_STORE, "readonly");
    const request = transaction.objectStore(PACK_STORE).getAll();

    request.onsuccess = () => {
      database.close();
      resolve(request.result as StoredPuzzlePack[]);
    };

    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

export async function deletePuzzlePack(packId: string): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PACK_STORE, "readwrite");

    transaction.objectStore(PACK_STORE).delete(packId);

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };

    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}