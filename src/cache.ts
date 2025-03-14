import { CacheStorage, CachedValidation } from "./types";

/**
 * Memory-based implementation of cache storage
 */
export class MemoryCacheStorage implements CacheStorage {
  private cache: Map<string, CachedValidation> = new Map();

  /**
   * Get cached validation data for a license key
   * @param key - The cache key
   * @returns The cached validation data, or null if not found
   */
  public async get(key: string): Promise<CachedValidation | null> {
    const data = this.cache.get(key);
    return data || null;
  }

  /**
   * Set cached validation data for a license key
   * @param key - The cache key
   * @param data - The validation data to cache
   */
  public async set(key: string, data: CachedValidation): Promise<void> {
    this.cache.set(key, data);
  }

  /**
   * Clear all cached validation data
   */
  public async clear(): Promise<void> {
    this.cache.clear();
  }
}

/**
 * LocalStorage-based implementation of cache storage (for browser environments)
 */
export class LocalStorageCacheStorage implements CacheStorage {
  private prefix = "codecheckout_license_";

  /**
   * Get cached validation data for a license key
   * @param key - The cache key
   * @returns The cached validation data, or null if not found
   */
  public async get(key: string): Promise<CachedValidation | null> {
    try {
      if (typeof localStorage === "undefined") {
        return null;
      }

      const data = localStorage.getItem(this.prefix + key);
      if (!data) {
        return null;
      }

      return JSON.parse(data) as CachedValidation;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  }

  /**
   * Set cached validation data for a license key
   * @param key - The cache key
   * @param data - The validation data to cache
   */
  public async set(key: string, data: CachedValidation): Promise<void> {
    try {
      if (typeof localStorage === "undefined") {
        return;
      }

      localStorage.setItem(this.prefix + key, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }

  /**
   * Clear all cached validation data
   */
  public async clear(): Promise<void> {
    try {
      if (typeof localStorage === "undefined") {
        return;
      }

      // Only clear items with our prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
}

/**
 * Factory function to create the appropriate cache storage based on the environment
 * @returns A cache storage implementation
 */
export function createCacheStorage(): CacheStorage {
  // Use localStorage in browser environments
  if (typeof localStorage !== "undefined") {
    return new LocalStorageCacheStorage();
  }

  // Fall back to memory cache
  return new MemoryCacheStorage();
}
