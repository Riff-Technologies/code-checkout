import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";
import { createCacheStorage } from "./cache";

// Create a shared cache instance
const cache = createCacheStorage();

// Cache for session ID (intentionally reset on page reload)
let cachedSessionId: string | null = null;

/**
 * Generate a unique license key
 * @returns A unique license key string
 */
export function generateLicenseKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate or retrieve a unique machine ID
 * @returns A unique machine ID string, or null if not available
 */
export async function getMachineId(): Promise<string | null> {
  try {
    // Try to get cached machine ID
    const machineIdData = await cache.get("machine_id");
    if (machineIdData?.isValid && typeof machineIdData.reason === "string") {
      return machineIdData.reason;
    }

    // Generate new machine ID if none exists
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    const newMachineId = Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Cache the new machine ID
    await cache.set("machine_id", {
      isValid: true,
      reason: newMachineId,
      timestamp: Date.now(),
    });

    return newMachineId;
  } catch (error) {
    console.error("Error generating machine ID:", error);
    return null;
  }
}

/**
 * Generate a unique session ID
 * @returns A unique session ID string, or null if not available
 */
export function generateSessionId(): string | null {
  if (cachedSessionId) {
    return cachedSessionId;
  }

  try {
    cachedSessionId = uuidv4();
    return cachedSessionId;
  } catch (error) {
    console.error("Error generating session ID:", error);
    return null;
  }
}

/**
 * Get a cached license key for a software ID
 * @param softwareId - The software ID to get the license key for
 * @returns The cached license key, or undefined if not found
 */
export async function getCachedLicenseKey(
  softwareId: string
): Promise<string | undefined> {
  try {
    const data = await cache.get(`license_${softwareId}`);
    if (data?.isValid && typeof data.reason === "string") {
      return data.reason;
    }
    return undefined;
  } catch (error) {
    console.error("Error getting cached license key:", error);
    return undefined;
  }
}

/**
 * Cache a license key for a software ID
 * @param softwareId - The software ID to cache the license key for
 * @param licenseKey - The license key to cache
 */
export async function cacheLicenseKey(
  softwareId: string,
  licenseKey: string
): Promise<void> {
  try {
    await cache.set(`license_${softwareId}`, {
      isValid: true,
      reason: licenseKey,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error caching license key:", error);
  }
}

/**
 * Get the current timestamp in ISO format
 * @returns The current timestamp string
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Create a cache key for license validation
 * @param licenseKey - The license key
 * @param softwareId - The software ID
 * @returns A unique cache key string
 */
export function createCacheKey(licenseKey: string, softwareId: string): string {
  return `${softwareId}:${licenseKey}`;
}
