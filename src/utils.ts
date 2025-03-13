import { v4 as uuidv4 } from "uuid";
import * as os from "os";
import * as crypto from "crypto";
import { getNodeJsLicenseKey, setNodeJsLicenseKey } from "./cache";

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

    // For Node.js environments, use the file-based cache
    if (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
    ) {
      return getNodeJsLicenseKey(softwareId);
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

    // For Node.js environments, use the file-based cache
    if (
      typeof process !== "undefined" &&
      process.versions &&
      process.versions.node
    ) {
      setNodeJsLicenseKey(softwareId, licenseKey);
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
 * Generate a unique machine ID based on hardware information
 * @returns A unique machine ID string, or null in Node.js server environments
 */
export function generateMachineId(): string | null {
  // For Node.js environments, return null as machine ID tracking is not appropriate for servers
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return null;
  }

  // Return cached machine ID if available
  if (cachedMachineId) {
    return cachedMachineId;
  }

  try {
    // Try to use hardware-specific information if available (browser or desktop app)
    if (
      typeof os !== "undefined" &&
      typeof os.networkInterfaces !== "undefined"
    ) {
      const networkInterfaces = os.networkInterfaces();
      const hostname = os.hostname();

      // Get MAC addresses from network interfaces
      const macAddresses: string[] = [];

      // Handle network interfaces safely
      Object.entries(networkInterfaces).forEach(([_, interfaces]) => {
        if (interfaces) {
          interfaces.forEach((iface: os.NetworkInterfaceInfo) => {
            if (iface.mac && iface.mac !== "00:00:00:00:00:00") {
              macAddresses.push(iface.mac);
            }
          });
        }
      });

      // Create a hash from hostname and MAC addresses
      if (macAddresses.length > 0) {
        const hash = crypto.createHash("sha256");
        hash.update(hostname + macAddresses.join(""));
        const machineId = hash.digest("hex");
        cachedMachineId = machineId;
        return machineId;
      }
    }
  } catch (error) {
    // Fall back to UUID if hardware info is unavailable
    console.error("Error generating machine ID from hardware info:", error);
  }

  // Try to get a persistent machine ID from storage (for browser environments)
  try {
    // Try to use localStorage in browser environments
    if (typeof localStorage !== "undefined") {
      const storedMachineId = localStorage.getItem("codecheckout_machine_id");
      if (storedMachineId) {
        cachedMachineId = storedMachineId;
        return storedMachineId;
      }

      const newMachineId = uuidv4();
      localStorage.setItem("codecheckout_machine_id", newMachineId);
      cachedMachineId = newMachineId;
      return newMachineId;
    }
  } catch (error) {
    console.error("Error getting/setting persistent machine ID:", error);
  }

  // Last resort: generate a new UUID each time (for browser environments)
  const fallbackMachineId = uuidv4();
  cachedMachineId = fallbackMachineId;
  return fallbackMachineId;
}

/**
 * Generate a unique session ID
 * @returns A unique session ID string, or null in Node.js server environments
 */
export function generateSessionId(): string | null {
  // For Node.js environments, return null as session ID tracking is not appropriate for servers
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    return null;
  }

  // Return cached session ID if available
  if (cachedSessionId) {
    return cachedSessionId;
  }

  const sessionId = uuidv4();
  cachedSessionId = sessionId;
  return sessionId;
}

/**
 * Get the current timestamp in ISO format
 * @returns Current timestamp string in ISO format
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
