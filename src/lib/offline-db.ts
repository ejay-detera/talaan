/**
 * Offline IndexedDB storage for captured notebook pages.
 * Store-and-forward architecture per docs/foundation.md.
 * Pure browser-native IndexedDB implementation with zero external dependencies.
 */

export interface OfflineScan {
  id: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

const DB_NAME = "talaan_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "offline_scans";

export function isIndexedDBSupported(): boolean {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

/**
 * Opens or upgrades the Talaan offline IndexedDB instance.
 */
export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      reject(new Error("IndexedDB is not supported in this environment"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error("Failed to open offline database"));
    };
  });
}

/**
 * Saves a captured photo blob to the offline IndexedDB store.
 */
export async function saveOfflineScan(
  file: Blob | File,
  fileName = "offline-scan.jpg"
): Promise<OfflineScan> {
  const db = await openOfflineDB();
  const scan: OfflineScan = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    blob: file,
    fileName: (file as File).name || fileName,
    mimeType: file.type || "image/jpeg",
    fileSize: file.size,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.add(scan);

      req.onsuccess = () => {
        resolve(scan);
      };

      req.onerror = () => {
        reject(req.error || new Error("Failed to save offline scan"));
      };

      tx.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

/**
 * Retrieves all queued offline scans, sorted from oldest to newest.
 */
export async function getOfflineScans(): Promise<OfflineScan[]> {
  if (!isIndexedDBSupported()) {
    return [];
  }

  const db = await openOfflineDB();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = (req.result as OfflineScan[]) || [];
        // Sort chronologically (oldest first for FIFO queue drain)
        results.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        resolve(results);
      };

      req.onerror = () => {
        reject(req.error || new Error("Failed to get offline scans"));
      };

      tx.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

/**
 * Removes a synced scan from the offline IndexedDB store by ID.
 */
export async function deleteOfflineScan(id: string): Promise<void> {
  if (!isIndexedDBSupported()) {
    return;
  }

  const db = await openOfflineDB();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        reject(req.error || new Error(`Failed to delete offline scan ${id}`));
      };

      tx.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

/**
 * Clears all queued offline scans.
 */
export async function clearOfflineScans(): Promise<void> {
  if (!isIndexedDBSupported()) {
    return;
  }

  const db = await openOfflineDB();

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => {
        resolve();
      };

      req.onerror = () => {
        reject(req.error || new Error("Failed to clear offline scans"));
      };

      tx.oncomplete = () => {
        db.close();
      };
    } catch (err) {
      db.close();
      reject(err);
    }
  });
}

