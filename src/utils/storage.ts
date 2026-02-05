import type { Pack } from "../types";

export interface AppSettings {
  soundEnabled: boolean;
}

const DB_NAME = "tete-db";
const DB_VERSION = 1;
const STORE_NAME = "packs";
const SETTINGS_KEY = "tete-settings";
const BEST_SCORES_KEY = "tete-best-scores";
const DEFAULT_SETTINGS: AppSettings = { soundEnabled: true };

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

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // silently fail - non-blocking
  }
}

export function getBestScore(packId: string, mode: string): number | null {
  try {
    const raw = localStorage.getItem(BEST_SCORES_KEY);
    const scores: Record<string, number> = raw ? JSON.parse(raw) : {};
    return scores[`${packId}:${mode}`] ?? null;
  } catch {
    return null;
  }
}

export function saveBestScore(packId: string, mode: string, score: number): boolean {
  try {
    const raw = localStorage.getItem(BEST_SCORES_KEY);
    const scores: Record<string, number> = raw ? JSON.parse(raw) : {};
    const key = `${packId}:${mode}`;
    const prev = scores[key] ?? 0;
    if (score > prev) {
      scores[key] = score;
      localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(scores));
      return true;
    }

    return false;
  } catch {
    return false;
  }
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
