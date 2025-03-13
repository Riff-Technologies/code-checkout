import { MemoryCacheStorage } from "../cache";
import { CachedValidation } from "../types";

describe("Cache", () => {
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
  });
});
