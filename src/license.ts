import { ValidateLicenseParams, ValidateLicenseResponse } from "./types";
import { createApiClient } from "./api";
import { generateMachineId, generateSessionId, createCacheKey } from "./utils";
import { getConfig } from "./config";
import { createCacheStorage } from "./cache";

// Default cache duration in hours
const DEFAULT_CACHE_DURATION = 24;

// Create a cache storage instance
const cacheStorage = createCacheStorage();

/**
 * Validate a license key with the CodeCheckout API
 * @param params - Parameters for license validation
 * @returns A promise that resolves to the validation response
 */
export async function validateLicense(
  params: ValidateLicenseParams
): Promise<ValidateLicenseResponse> {
  try {
    // Validate required parameters
    if (!params.licenseKey) {
      throw new Error("licenseKey is required for license validation");
    }

    // Get configuration with any overrides
    const config = getConfig({ softwareId: params.softwareId });

    // Fill in optional parameters with defaults if not provided
    const machineId = params.machineId || generateMachineId();
    const sessionId = params.sessionId || generateSessionId();
    const cacheDurationInHours =
      params.cacheDurationInHours || DEFAULT_CACHE_DURATION;
    const forceOnlineValidation = params.forceOnlineValidation || false;

    // Create a cache key for this license
    const cacheKey = createCacheKey(params.licenseKey, config.softwareId);

    // Check cache first if not forcing online validation
    if (!forceOnlineValidation) {
      const cachedData = await cacheStorage.get(cacheKey);

      if (cachedData) {
        const cacheAgeInHours =
          (Date.now() - cachedData.timestamp) / (1000 * 60 * 60);

        // If cache is still valid, return the cached result
        if (cacheAgeInHours < cacheDurationInHours) {
          // Perform background validation to refresh the cache
          refreshCacheInBackground(
            {
              ...params,
              machineId,
              sessionId,
            },
            cacheKey,
            config.softwareId
          );

          return {
            isValid: cachedData.isValid,
            reason: cachedData.reason,
          };
        }
      }
    }

    // Perform online validation
    return await performOnlineValidation(
      {
        ...params,
        machineId,
        sessionId,
      },
      cacheKey,
      config.softwareId
    );
  } catch (error) {
    console.error("Error validating license:", error);

    // In case of error, try to use cached data even if expired
    try {
      const cacheKey = createCacheKey(
        params.licenseKey,
        params.softwareId || getConfig().softwareId
      );

      const cachedData = await cacheStorage.get(cacheKey);
      if (cachedData) {
        return {
          isValid: cachedData.isValid,
          reason: cachedData.reason,
        };
      }
    } catch (cacheError) {
      console.error("Error retrieving cached license data:", cacheError);
    }

    // If all else fails, return invalid
    return {
      isValid: false,
      reason: "Error validating license",
    };
  }
}

/**
 * Perform online validation with the CodeCheckout API
 * @param params - Parameters for license validation
 * @param cacheKey - Cache key for storing the result
 * @param softwareId - Software ID for the validation
 * @returns A promise that resolves to the validation response
 */
async function performOnlineValidation(
  params: ValidateLicenseParams,
  cacheKey: string,
  softwareId: string
): Promise<ValidateLicenseResponse> {
  // Create API client
  const apiClient = createApiClient({ softwareId });

  // Make the API request
  const response = await apiClient.post<ValidateLicenseResponse>(
    "/license/validate",
    {
      licenseKey: params.licenseKey,
      softwareId,
      machineId: params.machineId || generateMachineId(),
      sessionId: params.sessionId || generateSessionId(),
      environment: params.environment || {},
    }
  );

  // Cache the result
  await cacheStorage.set(cacheKey, {
    isValid: response.isValid,
    reason: response.reason,
    timestamp: Date.now(),
  });

  return response;
}

/**
 * Refresh the cache in the background without blocking
 * @param params - Parameters for license validation
 * @param cacheKey - Cache key for storing the result
 * @param softwareId - Software ID for the validation
 */
function refreshCacheInBackground(
  params: ValidateLicenseParams,
  cacheKey: string,
  softwareId: string
): void {
  // Don't await this promise
  performOnlineValidation(params, cacheKey, softwareId).catch((error) => {
    console.error("Error refreshing license cache:", error);
  });
}
