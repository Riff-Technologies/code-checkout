import { CacheStorage, CachedValidation } from "./types";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

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
 * Get the cache directory path for Node.js environments
 * @returns The path to the cache directory
 */
function getNodeJsCacheDir(): string {
  const homeDir = os.homedir();
  const cacheDir = path.join(homeDir, ".codecheckout", "cache");

  // Create the cache directory if it doesn't exist
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  return cacheDir;
}

/**
 * Get a license key from the Node.js file cache
 * @param softwareId - The software ID to get the license key for
 * @returns The cached license key, or undefined if not found
 */
export function getNodeJsLicenseKey(softwareId: string): string | undefined {
  try {
    const cacheDir = getNodeJsCacheDir();
    const filePath = path.join(cacheDir, `license_${softwareId}.txt`);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8").trim();
    }

    return undefined;
  } catch (error) {
    console.error("Error reading Node.js license key cache:", error);
    return undefined;
  }
}

/**
 * Set a license key in the Node.js file cache
 * @param softwareId - The software ID to cache the license key for
 * @param licenseKey - The license key to cache
 */
export function setNodeJsLicenseKey(
  softwareId: string,
  licenseKey: string
): void {
  try {
    const cacheDir = getNodeJsCacheDir();
    const filePath = path.join(cacheDir, `license_${softwareId}.txt`);

    fs.writeFileSync(filePath, licenseKey);
  } catch (error) {
    console.error("Error writing to Node.js license key cache:", error);
  }
}

/**
 * File-based implementation of cache storage for Node.js environments
 */
export class FileSystemCacheStorage implements CacheStorage {
  private prefix = "validation_";

  /**
   * Get cached validation data for a license key
   * @param key - The cache key
   * @returns The cached validation data, or null if not found
   */
  public async get(key: string): Promise<CachedValidation | null> {
    try {
      // Only proceed if we're in a Node.js environment
      if (
        typeof process === "undefined" ||
        !process.versions ||
        !process.versions.node
      ) {
        return null;
      }

      const cacheDir = getNodeJsCacheDir();
      const filePath = path.join(cacheDir, `${this.prefix}${key}.json`);

      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data) as CachedValidation;
    } catch (error) {
      console.error("Error reading from file cache:", error);
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
      // Only proceed if we're in a Node.js environment
      if (
        typeof process === "undefined" ||
        !process.versions ||
        !process.versions.node
      ) {
        return;
      }

      const cacheDir = getNodeJsCacheDir();
      const filePath = path.join(cacheDir, `${this.prefix}${key}.json`);

      fs.writeFileSync(filePath, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to file cache:", error);
    }
  }

  /**
   * Clear all cached validation data
   */
  public async clear(): Promise<void> {
    try {
      // Only proceed if we're in a Node.js environment
      if (
        typeof process === "undefined" ||
        !process.versions ||
        !process.versions.node
      ) {
        return;
      }

      const cacheDir = getNodeJsCacheDir();

      // Read all files in the cache directory
      const files = fs.readdirSync(cacheDir);

      // Delete all validation cache files
      for (const file of files) {
        if (file.startsWith(this.prefix)) {
          fs.unlinkSync(path.join(cacheDir, file));
        }
      }
    } catch (error) {
      console.error("Error clearing file cache:", error);
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

  // Use file system cache in Node.js environments
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return new FileSystemCacheStorage();
  }

  // Fall back to memory cache
  return new MemoryCacheStorage();
}
