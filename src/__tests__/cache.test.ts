import {
  MemoryCacheStorage,
  LocalStorageCacheStorage,
  FileSystemCacheStorage,
  createCacheStorage,
  getNodeJsLicenseKey,
  setNodeJsLicenseKey,
} from "../cache";
import { CachedValidation } from "../types";
import * as fs from "fs";

// Mock fs module
jest.mock("fs", () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  readdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

jest.mock("os", () => ({
  homedir: jest.fn(() => "/mock/home/dir"),
}));

// Mock process and localStorage types
interface MockProcess {
  versions?: {
    node?: string;
  };
}

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

  describe("FileSystemCacheStorage", () => {
    let cacheStorage: FileSystemCacheStorage;

    beforeEach(() => {
      cacheStorage = new FileSystemCacheStorage();
      // Mock process.versions for Node.js environment check
      (global as unknown as { process: MockProcess }).process = {
        versions: { node: "16.0.0" },
      };
    });

    test("get should return null when not in Node.js environment", async () => {
      (global as unknown as { process: MockProcess | undefined }).process =
        undefined;
      const result = await cacheStorage.get("test-key");
      expect(result).toBeNull();
    });

    test("get should return null for non-existent file", async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = await cacheStorage.get("non-existent-key");
      expect(result).toBeNull();
    });

    test("get should handle file read errors", async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Read error");
      });

      const result = await cacheStorage.get("test-key");
      expect(result).toBeNull();
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error reading from file cache:",
        expect.any(Error)
      );
    });

    test("set and get should store and retrieve data", async () => {
      const key = "test-key";
      const data: CachedValidation = {
        isValid: true,
        timestamp: Date.now(),
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(data));

      await cacheStorage.set(key, data);
      const result = await cacheStorage.get(key);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(key),
        JSON.stringify(data)
      );
      expect(result).toEqual(data);
    });

    test("set should handle file write errors", async () => {
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Write error");
      });

      const key = "test-key";
      const data: CachedValidation = {
        isValid: true,
        timestamp: Date.now(),
      };

      await cacheStorage.set(key, data);
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error writing to file cache:",
        expect.any(Error)
      );
    });

    test("clear should remove all validation cache files", async () => {
      const files = [
        "validation_key1.json",
        "other_file.txt",
        "validation_key2.json",
      ];
      (fs.readdirSync as jest.Mock).mockReturnValue(files);

      await cacheStorage.clear();

      expect(fs.unlinkSync).toHaveBeenCalledTimes(2);
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining("validation_key1.json")
      );
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        expect.stringContaining("validation_key2.json")
      );
    });

    test("clear should handle directory read errors", async () => {
      (fs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error("Read error");
      });

      await cacheStorage.clear();
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error clearing file cache:",
        expect.any(Error)
      );
    });
  });

  describe("Node.js License Key Cache", () => {
    beforeEach(() => {
      // Mock process.versions for Node.js environment check
      (global as unknown as { process: MockProcess }).process = {
        versions: { node: "16.0.0" },
      };
    });

    test("getNodeJsLicenseKey should return undefined for non-existent file", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      const result = getNodeJsLicenseKey("test-software");
      expect(result).toBeUndefined();
    });

    test("getNodeJsLicenseKey should return license key from file", () => {
      const licenseKey = "TEST-LICENSE-KEY";
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(licenseKey);

      const result = getNodeJsLicenseKey("test-software");
      expect(result).toBe(licenseKey);
    });

    test("getNodeJsLicenseKey should handle file read errors", () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Read error");
      });

      const result = getNodeJsLicenseKey("test-software");
      expect(result).toBeUndefined();
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error reading Node.js license key cache:",
        expect.any(Error)
      );
    });

    test("setNodeJsLicenseKey should write license key to file", () => {
      const softwareId = "test-software";
      const licenseKey = "TEST-LICENSE-KEY";

      setNodeJsLicenseKey(softwareId, licenseKey);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining(softwareId),
        licenseKey
      );
    });

    test("setNodeJsLicenseKey should handle file write errors", () => {
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {
        throw new Error("Write error");
      });

      setNodeJsLicenseKey("test-software", "TEST-LICENSE-KEY");
      expect(mockConsoleError).toHaveBeenCalledWith(
        "Error writing to Node.js license key cache:",
        expect.any(Error)
      );
    });
  });

  describe("createCacheStorage", () => {
    const originalLocalStorage = (
      global as unknown as { localStorage: MockStorage }
    ).localStorage;
    const originalProcess = (global as unknown as { process: MockProcess })
      .process;

    afterEach(() => {
      (global as unknown as { localStorage: MockStorage }).localStorage =
        originalLocalStorage;
      (global as unknown as { process: MockProcess }).process = originalProcess;
    });

    test("should return LocalStorageCacheStorage when localStorage is available", () => {
      (global as unknown as { localStorage: MockStorage }).localStorage =
        mockLocalStorage;
      (global as unknown as { process: MockProcess | undefined }).process =
        undefined;

      const storage = createCacheStorage();
      expect(storage).toBeInstanceOf(LocalStorageCacheStorage);
    });

    test("should return FileSystemCacheStorage when in Node.js environment", () => {
      (
        global as unknown as { localStorage: MockStorage | undefined }
      ).localStorage = undefined;
      (global as unknown as { process: MockProcess }).process = {
        versions: { node: "16.0.0" },
      };

      const storage = createCacheStorage();
      expect(storage).toBeInstanceOf(FileSystemCacheStorage);
    });

    test("should return MemoryCacheStorage when no other storage is available", () => {
      (
        global as unknown as { localStorage: MockStorage | undefined }
      ).localStorage = undefined;
      (global as unknown as { process: MockProcess | undefined }).process =
        undefined;

      const storage = createCacheStorage();
      expect(storage).toBeInstanceOf(MemoryCacheStorage);
    });
  });
});
