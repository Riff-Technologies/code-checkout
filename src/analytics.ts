import { AnalyticsEventParams, AnalyticsEventResponse } from "./types";
import { createApiClient } from "./api";
import {
  generateMachineId,
  generateSessionId,
  getCurrentTimestamp,
} from "./utils";

/**
 * Log an analytics event to the CodeCheckout API
 * @param params - Parameters for the analytics event
 * @returns A promise that resolves to the response from the API
 */
export async function logAnalyticsEvent(
  params: AnalyticsEventParams
): Promise<AnalyticsEventResponse> {
  try {
    // Validate required parameters
    if (!params.softwareId) {
      throw new Error("softwareId is required for analytics events");
    }

    if (!params.commandId) {
      throw new Error("commandId is required for analytics events");
    }

    // Fill in optional parameters with defaults if not provided
    const machineId = params.machineId || generateMachineId();
    const sessionId = params.sessionId || generateSessionId();
    const timestamp = params.timestamp || getCurrentTimestamp();

    // Create API client with the provided softwareId
    const apiClient = createApiClient({ softwareId: params.softwareId });

    // Make the API request in the background
    const requestPromise = apiClient.post<AnalyticsEventResponse>(
      "/analytics/event",
      {
        extensionId: params.softwareId,
        commandId: params.commandId,
        licenseKey: params.licenseKey,
        machineId,
        sessionId,
        timestamp,
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
