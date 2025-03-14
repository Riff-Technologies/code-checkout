import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

// Cache for machine and session IDs
let cachedMachineId: string | null = null;
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
 * Generate a unique machine ID
 * @returns A unique machine ID string, or null if not available
 */
export function generateMachineId(): string | null {
  if (cachedMachineId) {
    return cachedMachineId;
  }

  try {
    // Try to use crypto API for a unique ID
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);
    cachedMachineId = Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return cachedMachineId;
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
export function getCachedLicenseKey(softwareId: string): string | undefined {
  try {
    // Try to get the license key from localStorage in browser environments
    if (typeof localStorage !== "undefined") {
      const key = `codecheckout_license_${softwareId}`;
      return localStorage.getItem(key) || undefined;
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
export function cacheLicenseKey(softwareId: string, licenseKey: string): void {
  try {
    // Try to store the license key in localStorage in browser environments
    if (typeof localStorage !== "undefined") {
      const key = `codecheckout_license_${softwareId}`;
      localStorage.setItem(key, licenseKey);
      return;
    }

    console.log(
      `Caching license key ${licenseKey} for software ID ${softwareId}`
    );
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
