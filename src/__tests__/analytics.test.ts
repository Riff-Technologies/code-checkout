import { logAnalyticsEvent } from "../analytics";
import { createApiClient } from "../api";
import * as utils from "../utils";
import { AnalyticsEventParams } from "../types";

// Mock dependencies
jest.mock("../api", () => ({
  createApiClient: jest.fn(),
}));

jest.mock("../utils", () => ({
  generateMachineId: jest.fn().mockReturnValue("test-machine-id"),
  generateSessionId: jest.fn().mockReturnValue("test-session-id"),
  getCurrentTimestamp: jest.fn().mockReturnValue("2023-01-01T00:00:00.000Z"),
  getCachedLicenseKey: jest.fn().mockReturnValue(undefined),
  createCacheKey: jest
    .fn()
    .mockImplementation(
      (licenseKey, softwareId) => `${softwareId}:${licenseKey}`
    ),
}));

describe("Analytics", () => {
  // Mock console.error to track error logging
  const originalConsoleError = console.error;
  const mockConsoleError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = mockConsoleError;

    // Mock API client with successful response
    const mockPost = jest.fn().mockResolvedValue({ success: true });
    (createApiClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  test("logAnalyticsEvent should throw error if softwareId is not provided", async () => {
    const params = { commandId: "test.command" } as AnalyticsEventParams;
    const result = await logAnalyticsEvent(params);

    expect(result).toEqual({ success: false });
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error preparing analytics event:",
      expect.any(Error)
    );
  });

  test("logAnalyticsEvent should throw error if commandId is not provided", async () => {
    const params = { softwareId: "test-software" } as AnalyticsEventParams;
    const result = await logAnalyticsEvent(params);

    expect(result).toEqual({ success: false });
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error preparing analytics event:",
      expect.any(Error)
    );
  });

  test("logAnalyticsEvent should return success immediately", async () => {
    const result = await logAnalyticsEvent({
      softwareId: "test-software",
      commandId: "test.command",
    });

    expect(result).toEqual({ success: true });
  });

  test("logAnalyticsEvent should handle API errors gracefully", async () => {
    const mockError = new Error("API Error");
    const mockPost = jest.fn().mockRejectedValue(mockError);
    (createApiClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    const result = await logAnalyticsEvent({
      softwareId: "test-software",
      commandId: "test.command",
    });

    // Should still return success since it's fire-and-forget
    expect(result).toEqual({ success: true });

    // Wait for the error to be logged
    await new Promise(process.nextTick);
    expect(mockConsoleError).toHaveBeenCalledWith(
      "Error logging analytics event:",
      mockError
    );
  });

  test("logAnalyticsEvent should handle metadata correctly", async () => {
    const params: AnalyticsEventParams = {
      softwareId: "test-software",
      commandId: "test.command",
      metadata: {
        category: "test",
        value: 123,
        nested: { key: "value" },
      },
    };

    await logAnalyticsEvent(params);

    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/analytics/events",
      expect.objectContaining({
        extensionId: params.softwareId,
        commandId: params.commandId,
        metadata: params.metadata,
      })
    );
  });

  test("logAnalyticsEvent should use provided values", async () => {
    const params: AnalyticsEventParams = {
      softwareId: "test-software",
      commandId: "test.command",
      licenseKey: "TEST-LICENSE-KEY",
      machineId: "custom-machine-id",
      sessionId: "custom-session-id",
      timestamp: "custom-timestamp",
    };

    await logAnalyticsEvent(params);

    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/analytics/events",
      expect.objectContaining({
        extensionId: params.softwareId,
        commandId: params.commandId,
        licenseKey: params.licenseKey,
        hasValidLicense: true,
        machineId: params.machineId,
        sessionId: params.sessionId,
        timestamp: params.timestamp,
      })
    );

    // Verify we didn't call the utility functions since values were provided
    expect(utils.generateMachineId).not.toHaveBeenCalled();
    expect(utils.generateSessionId).not.toHaveBeenCalled();
    expect(utils.getCurrentTimestamp).not.toHaveBeenCalled();
    expect(utils.getCachedLicenseKey).not.toHaveBeenCalled();
  });

  test("logAnalyticsEvent should use default values when not provided", async () => {
    const params: AnalyticsEventParams = {
      softwareId: "test-software",
      commandId: "test.command",
    };

    await logAnalyticsEvent(params);

    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/analytics/events",
      expect.objectContaining({
        extensionId: params.softwareId,
        commandId: params.commandId,
        hasValidLicense: false,
        machineId: "test-machine-id",
        sessionId: "test-session-id",
        timestamp: "2023-01-01T00:00:00.000Z",
      })
    );

    // Verify we called the utility functions to generate default values
    expect(utils.generateMachineId).toHaveBeenCalled();
    expect(utils.generateSessionId).toHaveBeenCalled();
    expect(utils.getCurrentTimestamp).toHaveBeenCalled();
    expect(utils.getCachedLicenseKey).toHaveBeenCalled();
  });

  test("logAnalyticsEvent should set hasValidLicense based on licenseKey", async () => {
    // Mock getCachedLicenseKey to return a license key
    (utils.getCachedLicenseKey as jest.Mock).mockReturnValue(
      "CACHED-LICENSE-KEY"
    );

    const params: AnalyticsEventParams = {
      softwareId: "test-software",
      commandId: "test.command",
    };

    await logAnalyticsEvent(params);

    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/analytics/events",
      expect.objectContaining({
        extensionId: params.softwareId,
        commandId: params.commandId,
        licenseKey: "CACHED-LICENSE-KEY",
        hasValidLicense: true,
      })
    );
  });

  test("logAnalyticsEvent should execute API call in background", async () => {
    let apiCallCompleted = false;
    const mockPost = jest.fn().mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      apiCallCompleted = true;
      return { success: true };
    });
    (createApiClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });

    const result = await logAnalyticsEvent({
      softwareId: "test-software",
      commandId: "test.command",
    });

    // Should return immediately before API call completes
    expect(result).toEqual({ success: true });
    expect(apiCallCompleted).toBe(false);

    // Wait for API call to complete
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(apiCallCompleted).toBe(true);
  });
});
