import { describe, it, expect, afterEach, vi } from "vitest";
import {
  isIndexedDBSupported,
  getOfflineScans,
  saveOfflineScan,
  deleteOfflineScan,
  clearOfflineScans,
} from "../offline-db";

describe("Offline IndexedDB Store-and-Forward Queue", () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  it("handles non-browser (Node / SSR) environments gracefully", async () => {
    // When window or indexedDB is undefined
    delete (global as unknown as { window?: unknown }).window;

    expect(isIndexedDBSupported()).toBe(false);
    await expect(getOfflineScans()).resolves.toEqual([]);
    await expect(deleteOfflineScan("test-id")).resolves.toBeUndefined();
    await expect(clearOfflineScans()).resolves.toBeUndefined();
  });

  it("saves and retrieves offline scans with mocked IndexedDB", async () => {
    const store = new Map<string, unknown>();

    const mockIDBDatabase = {
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          add: vi.fn((data) => {
            store.set(data.id, data);
            const req = { onsuccess: null as unknown, onerror: null as unknown };
            setTimeout(() => {
              if (typeof req.onsuccess === "function") (req.onsuccess as () => void)();
            }, 0);
            return req;
          }),
          getAll: vi.fn(() => {
            const req = {
              result: Array.from(store.values()),
              onsuccess: null as unknown,
              onerror: null as unknown,
            };
            setTimeout(() => {
              if (typeof req.onsuccess === "function") (req.onsuccess as () => void)();
            }, 0);
            return req;
          }),
          delete: vi.fn((id: string) => {
            store.delete(id);
            const req = { onsuccess: null as unknown, onerror: null as unknown };
            setTimeout(() => {
              if (typeof req.onsuccess === "function") (req.onsuccess as () => void)();
            }, 0);
            return req;
          }),
          clear: vi.fn(() => {
            store.clear();
            const req = { onsuccess: null as unknown, onerror: null as unknown };
            setTimeout(() => {
              if (typeof req.onsuccess === "function") (req.onsuccess as () => void)();
            }, 0);
            return req;
          }),
        }),
      }),
      close: vi.fn(),
    };

    const mockIndexedDB = {
      open: vi.fn().mockReturnValue({
        result: mockIDBDatabase,
        onsuccess: null as unknown,
        onerror: null as unknown,
      }),
    };

    // Trigger onsuccess immediately when open is called
    mockIndexedDB.open.mockImplementation(() => {
      const req = {
        result: mockIDBDatabase,
        onsuccess: null as unknown,
        onerror: null as unknown,
      };
      setTimeout(() => {
        if (typeof req.onsuccess === "function") (req.onsuccess as () => void)();
      }, 0);
      return req;
    });

    (global as unknown as { window: unknown }).window = {
      indexedDB: mockIndexedDB as unknown as IDBFactory,
    };

    expect(isIndexedDBSupported()).toBe(true);

    const fakeBlob = new Blob(["test image content"], { type: "image/jpeg" });
    const saved = await saveOfflineScan(fakeBlob, "page-oct29.jpg");

    expect(saved.id).toBeDefined();
    expect(saved.fileName).toBe("page-oct29.jpg");
    expect(saved.mimeType).toBe("image/jpeg");

    const all = await getOfflineScans();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(saved.id);

    await deleteOfflineScan(saved.id);
    const afterDelete = await getOfflineScans();
    expect(afterDelete.length).toBe(0);
  });
});
