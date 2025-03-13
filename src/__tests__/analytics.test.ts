import { logAnalyticsEvent } from "../analytics";
import { createApiClient } from "../api";
import * as utils from "../utils";

// Mock dependencies
jest.mock("../api", () => ({
  createApiClient: jest.fn(),
}));

jest.mock("../utils", () => ({
  generateMachineId: jest.fn().mockReturnValue("test-machine-id"),
  generateSessionId: jest.fn().mockReturnValue("test-session-id"),
  getCurrentTimestamp: jest.fn().mockReturnValue("2023-01-01T00:00:00.000Z"),
}));

describe("Analytics", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API client
    const mockPost = jest.fn().mockResolvedValue({ success: true });
    (createApiClient as jest.Mock).mockReturnValue({
      post: mockPost,
    });
  });

  test("logAnalyticsEvent should throw error if softwareId is not provided", async () => {
    await expect(
      // @ts-expect-error: Intentionally missing required property for test
      logAnalyticsEvent({ commandId: "test.command" })
    ).resolves.toEqual({ success: false });
  });

  test("logAnalyticsEvent should throw error if commandId is not provided", async () => {
    await expect(
      // @ts-expect-error: Intentionally missing required property for test
      logAnalyticsEvent({ softwareId: "test-software" })
    ).resolves.toEqual({ success: false });
  });

  test("logAnalyticsEvent should return success immediately", async () => {
    const result = await logAnalyticsEvent({
      softwareId: "test-software",
      commandId: "test.command",
    });

    expect(result).toEqual({ success: true });
  });

  test("logAnalyticsEvent should use provided values", async () => {
    const params = {
      softwareId: "test-software",
      commandId: "test.command",
      licenseKey: "TEST-LICENSE-KEY",
      machineId: "custom-machine-id",
      sessionId: "custom-session-id",
      timestamp: "custom-timestamp",
    };

    await logAnalyticsEvent(params);

    expect(createApiClient).toHaveBeenCalledWith({
      softwareId: params.softwareId,
    });

    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/analytics/event",
      expect.objectContaining({
        softwareId: params.softwareId,
        commandId: params.commandId,
        licenseKey: params.licenseKey,
        machineId: params.machineId,
        sessionId: params.sessionId,
        timestamp: params.timestamp,
      })
    );

    // Verify we didn't call the utility functions since values were provided
    expect(utils.generateMachineId).not.toHaveBeenCalled();
    expect(utils.generateSessionId).not.toHaveBeenCalled();
    expect(utils.getCurrentTimestamp).not.toHaveBeenCalled();
  });

  test("logAnalyticsEvent should use default values when not provided", async () => {
    const params = {
      softwareId: "test-software",
      commandId: "test.command",
    };

    await logAnalyticsEvent(params);

    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;
    expect(mockApiClient.post).toHaveBeenCalledWith(
      "/analytics/event",
      expect.objectContaining({
        softwareId: params.softwareId,
        commandId: params.commandId,
        machineId: "test-machine-id",
        sessionId: "test-session-id",
        timestamp: "2023-01-01T00:00:00.000Z",
      })
    );

    // Verify we called the utility functions to generate default values
    expect(utils.generateMachineId).toHaveBeenCalled();
    expect(utils.generateSessionId).toHaveBeenCalled();
    expect(utils.getCurrentTimestamp).toHaveBeenCalled();
  });
});
