import type { Pack } from "../types";

const DB_NAME = "tete-db";
const DB_VERSION = 1;
const STORE_NAME = "packs";

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

export async function getCustomPacks(): Promise<Pack[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      reject(new Error("Failed to fetch packs"));
    };

    request.onsuccess = () => {
      resolve(request.result as Pack[]);
    };
  });
}

export async function savePack(pack: Pack): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(pack);

    request.onerror = () => {
      reject(new Error("Failed to save pack"));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}

export async function deletePack(packId: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(packId);

    request.onerror = () => {
      reject(new Error("Failed to delete pack"));
    };

    request.onsuccess = () => {
      resolve();
    };
  });
}
