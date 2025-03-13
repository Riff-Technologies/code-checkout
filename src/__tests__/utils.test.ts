import {
  generateLicenseKey,
  generateMachineId,
  generateSessionId,
  getCurrentTimestamp,
  createCacheKey,
} from "../utils";

describe("Utils", () => {
  test("generateLicenseKey should return a unique string", () => {
    const key1 = generateLicenseKey();
    const key2 = generateLicenseKey();

    expect(typeof key1).toBe("string");
    expect(key1.length).toBeGreaterThan(0);
    expect(key1).not.toEqual(key2); // Keys should be unique
  });

  test("generateMachineId should return a string or null", () => {
    const machineId = generateMachineId();

    if (machineId !== null) {
      expect(typeof machineId).toBe("string");
      expect(machineId.length).toBeGreaterThan(0);
    } else {
      // In Node.js environments, it should return null
      expect(
        typeof process !== "undefined" &&
          !!process.versions &&
          !!process.versions.node
      ).toBe(true);
    }
  });

  test("generateSessionId should return a string or null", () => {
    const sessionId = generateSessionId();

    if (sessionId !== null) {
      expect(typeof sessionId).toBe("string");
      expect(sessionId.length).toBeGreaterThan(0);
    } else {
      // In Node.js environments, it should return null
      expect(
        typeof process !== "undefined" &&
          !!process.versions &&
          !!process.versions.node
      ).toBe(true);
    }
  });

  test("getCurrentTimestamp should return a valid ISO timestamp", () => {
    const timestamp = getCurrentTimestamp();

    expect(typeof timestamp).toBe("string");
    expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    expect(new Date(timestamp).getTime()).not.toBeNaN();
  });

  test("createCacheKey should combine softwareId and licenseKey", () => {
    const softwareId = "test-software";
    const licenseKey = "TEST-LICENSE-KEY";
    const cacheKey = createCacheKey(licenseKey, softwareId);

    expect(cacheKey).toBe(`${softwareId}:${licenseKey}`);
  });
});
