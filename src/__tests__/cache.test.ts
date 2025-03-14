import {
  MemoryCacheStorage,
  LocalStorageCacheStorage,
  createCacheStorage,
} from "../cache";
import { CachedValidation } from "../types";

// Mock localStorage type
interface MockStorage {
  getItem: jest.Mock;
  setItem: jest.Mock;
  removeItem: jest.Mock;
  clear: jest.Mock;
  key: jest.Mock;
  length: number;
  [Symbol.iterator]: jest.Mock;
}

// Create a shared mock localStorage instance
const mockLocalStorage: MockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0,
  [Symbol.iterator]: jest.fn(),
};

describe("Cache", () => {
  // Mock console.error to track error logging
  const originalConsoleError = console.error;
  const mockConsoleError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = mockConsoleError;
  });

  afterEach(() => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  describe("MemoryCacheStorage", () => {
    let cacheStorage: MemoryCacheStorage;

    beforeEach(() => {
      cacheStorage = new MemoryCacheStorage();
    });

    test("get should return null for non-existent key", async () => {
      const result = await cacheStorage.get("non-existent-key");
      expect(result).toBeNull();
    });

    test("set and get should store and retrieve data", async () => {
      const key = "test-key";
      const data: CachedValidation = {
        isValid: true,
        timestamp: Date.now(),
      };

      await cacheStorage.set(key, data);
      const result = await cacheStorage.get(key);

      expect(result).toEqual(data);
    });

    test("clear should remove all data", async () => {
      const key1 = "test-key-1";
      const key2 = "test-key-2";
      const data: CachedValidation = {
        isValid: true,
        timestamp: Date.now(),
      };

      await cacheStorage.set(key1, data);
      await cacheStorage.set(key2, data);

      await cacheStorage.clear();

      const result1 = await cacheStorage.get(key1);
      const result2 = await cacheStorage.get(key2);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    test("set should overwrite existing data", async () => {
      const key = "test-key";
      const data1: CachedValidation = {
        isValid: true,
        timestamp: Date.now(),
      };
      const data2: CachedValidation = {
        isValid: false,
        timestamp: Date.now() + 1000,
        reason: "Test reason",
      };

      await cacheStorage.set(key, data1);
      await cacheStorage.set(key, data2);
      const result = await cacheStorage.get(key);

      expect(result).toEqual(data2);
    });
  });

  describe("LocalStorageCacheStorage", () => {
    let cacheStorage: LocalStorageCacheStorage;

    beforeEach(() => {
      // Mock localStorage
      (global as unknown as { localStorage: MockStorage }).localStorage =
        mockLocalStorage;
      cacheStorage = new LocalStorageCacheStorage();
      mockLocalStorage.length = 0;
    });

    test("get should return null when localStorage is undefined", async () => {
      (
        global as unknown as { localStorage: MockStorage | undefined }
      ).localStorage = undefined;
      const result = await cacheStorage.get("test-key");
      expect(result).toBeNull();
    });

    test("get should return null for non-existent key", async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = await cacheStorage.get("non-existent-key");
      expect(result).toBeNull();
    });

    test("get should handle invalid JSON data", async () => {
      mockLocalStorage.getItem.mockReturnValue("invalid-json");
      const result = await cacheStorage.get("test-key");
      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error reading from localStorage:",
        expect.any(Error)
      );
    });

    test("set and get should store and retrieve data", async () => {
      const key = "test-key";
      const data: CachedValidation = {
        isValid: true,
        timestamp: Date.now(),
      };

      await cacheStorage.set(key, data);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "codecheckout_license_" + key,
        JSON.stringify(data)
      );

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(data));
      const result = await cacheStorage.get(key);
      expect(result).toEqual(data);
    });

    test("set should handle localStorage errors", async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error("Storage full");
      });

      const key = "test-key";
      const data: CachedValidation = {
        isValid: true,
        timestamp: Date.now(),
      };

      await cacheStorage.set(key, data);
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error writing to localStorage:",
        expect.any(Error)
      );
    });

    test("clear should remove only prefixed items", async () => {
      mockLocalStorage.length = 3;
      mockLocalStorage.key
        .mockReturnValueOnce("codecheckout_license_key1")
        .mockReturnValueOnce("other_key")
        .mockReturnValueOnce("codecheckout_license_key2");

      await cacheStorage.clear();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "codecheckout_license_key1"
      );
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        "codecheckout_license_key2"
      );
    });
  });

  describe("createCacheStorage", () => {
    const originalLocalStorage = (
      global as unknown as { localStorage: MockStorage }
    ).localStorage;

    afterEach(() => {
      (global as unknown as { localStorage: MockStorage }).localStorage =
        originalLocalStorage;
    });

    test("should return LocalStorageCacheStorage when localStorage is available", () => {
      (global as unknown as { localStorage: MockStorage }).localStorage =
        mockLocalStorage;

      const storage = createCacheStorage();
      expect(storage).toBeInstanceOf(LocalStorageCacheStorage);
    });

    test("should return MemoryCacheStorage when localStorage is not available", () => {
      (
        global as unknown as { localStorage: MockStorage | undefined }
      ).localStorage = undefined;

      const storage = createCacheStorage();
      expect(storage).toBeInstanceOf(MemoryCacheStorage);
    });
  });
});
