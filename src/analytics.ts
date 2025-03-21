import { AnalyticsEventParams, AnalyticsEventResponse } from "./types";
import { createApiClient } from "./api";
import {
  getMachineId,
  generateSessionId,
  getCurrentTimestamp,
  getCachedLicenseKey,
} from "./utils";

/**
 * Log an analytics event to the code-checkout API
 * @param params - Parameters for the analytics event
 * @returns A promise that resolves to the response from the API
 */
export async function logAnalyticsEvent(
  params: AnalyticsEventParams
): Promise<AnalyticsEventResponse> {
  try {
    const softwareId = params.softwareId;
    // Validate required parameters
    if (!softwareId) {
      throw new Error("softwareId is required for analytics events");
    }

    if (!params.commandId) {
      throw new Error("commandId is required for analytics events");
    }

    // Fill in optional parameters with defaults if not provided
    const machineId = params.machineId || (await getMachineId()) || undefined;
    const sessionId = params.sessionId || generateSessionId() || undefined;
    const timestamp = params.timestamp || getCurrentTimestamp();

    // Try to get a cached license key if one isn't provided
    const licenseKey =
      params.licenseKey || (await getCachedLicenseKey(softwareId));

    // Create API client
    const apiClient = createApiClient();

    // Make the API request in the background
    const requestPromise = apiClient.post<AnalyticsEventResponse>(
      "/analytics/events",
      {
        extensionId: softwareId,
        commandId: params.commandId,
        licenseKey,
        hasValidLicense: !!licenseKey,
        machineId,
        sessionId,
        timestamp,
        metadata: params.metadata,
      }
    );

    // Don't wait for the response, but handle errors silently
    requestPromise.catch((error) => {
      console.error("Error logging analytics event:", error);
    });

    // Always return success immediately
    return { success: true };
  } catch (error) {
    // Log the error but don't throw it to the caller
    console.error("Error preparing analytics event:", error);
    return { success: false };
  }
}
