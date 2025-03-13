import { v4 as uuidv4 } from "uuid";
import * as os from "os";
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
 * Generate a unique machine ID based on hardware information
 * @returns A unique machine ID string
 */
export function generateMachineId(): string {
  // Return cached machine ID if available
  if (cachedMachineId) {
    return cachedMachineId;
  }

  try {
    // Try to use hardware-specific information if available
    if (typeof os !== "undefined") {
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

  // Fall back to a persistent random ID
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
    // Ignore localStorage errors
  }

  // Last resort: generate a new UUID each time
  const fallbackMachineId = uuidv4();
  cachedMachineId = fallbackMachineId;
  return fallbackMachineId;
}

/**
 * Generate a unique session ID
 * @returns A unique session ID string
 */
export function generateSessionId(): string {
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
