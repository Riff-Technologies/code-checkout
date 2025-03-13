import { generateCheckoutUrl } from "../checkout";
import { getConfig } from "../config";
import { createApiClient } from "../api";

// Mock the license key generation to make tests deterministic
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  generateLicenseKey: jest.fn().mockReturnValue("TEST-LICENSE-KEY"),
}));

// Mock the config module
jest.mock("../config", () => {
  const originalModule = jest.requireActual("../config");
  return {
    ...originalModule,
    getConfig: jest.fn(),
    configure: jest.fn(),
    resetConfig: jest.fn(),
  };
});

// Mock the API client
jest.mock("../api", () => ({
  createApiClient: jest.fn(),
}));

describe("Checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API client
    const mockGet = jest
      .fn()
      .mockResolvedValue({ url: "https://mocked-checkout-url.com" });
    (createApiClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });
  });

  test("generateCheckoutUrl should throw error if testMode is not set", async () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
    });

    await expect(
      // @ts-expect-error: Intentionally missing required property for test
      generateCheckoutUrl({})
    ).rejects.toThrow("testMode must be explicitly set");
  });

  test("generateCheckoutUrl should call the API and return the checkout URL", async () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
      defaultSuccessUrl: "https://test.com/success",
      defaultCancelUrl: "https://test.com/cancel",
    });

    const result = await generateCheckoutUrl({ testMode: false });

    // Verify the API client was created with the correct config
    expect(createApiClient).toHaveBeenCalledWith({
      softwareId: "test-software",
    });

    // Get the mocked API client
    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;

    // Verify the API was called with the correct parameters
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/test-software/checkout",
      expect.objectContaining({
        licenseKey: "TEST-LICENSE-KEY",
        successUrl: "https://test.com/success",
        cancelUrl: "https://test.com/cancel",
      })
    );

    // Verify the result contains the expected values
    expect(result).toEqual({
      licenseKey: "TEST-LICENSE-KEY",
      url: "https://mocked-checkout-url.com",
    });
  });

  test("generateCheckoutUrl should include testMode parameter when true", async () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
    });

    await generateCheckoutUrl({ testMode: true });

    // Get the mocked API client
    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;

    // Verify testMode was included in the API call
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/test-software/checkout",
      expect.objectContaining({
        testMode: true,
      })
    );
  });

  test("generateCheckoutUrl should use provided URLs over defaults", async () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
      defaultSuccessUrl: "https://default-success.com",
      defaultCancelUrl: "https://default-cancel.com",
    });

    const customSuccessUrl = "https://custom-success.com";
    const customCancelUrl = "https://custom-cancel.com";

    await generateCheckoutUrl({
      testMode: false,
      successUrl: customSuccessUrl,
      cancelUrl: customCancelUrl,
    });

    // Get the mocked API client
    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;

    // Verify custom URLs were used in the API call
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/test-software/checkout",
      expect.objectContaining({
        successUrl: customSuccessUrl,
        cancelUrl: customCancelUrl,
      })
    );
  });

  test("generateCheckoutUrl should use provided licenseKey if available", async () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
    });

    const customLicenseKey = "CUSTOM-LICENSE-KEY";

    await generateCheckoutUrl({
      testMode: false,
      licenseKey: customLicenseKey,
    });

    // Get the mocked API client
    const mockApiClient = (createApiClient as jest.Mock).mock.results[0].value;

    // Verify custom license key was used in the API call
    expect(mockApiClient.get).toHaveBeenCalledWith(
      "/test-software/checkout",
      expect.objectContaining({
        licenseKey: customLicenseKey,
      })
    );
  });

  test("generateCheckoutUrl should fall back to local URL construction if API fails", async () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
      baseUrl: "https://dev-api.riff-tech.com/v1",
    });

    // Mock API client to throw an error
    const mockGet = jest.fn().mockRejectedValue(new Error("API error"));
    (createApiClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    const result = await generateCheckoutUrl({ testMode: true });

    // Verify the result contains a fallback URL
    expect(result.licenseKey).toBe("TEST-LICENSE-KEY");
    expect(result.url).toContain("https://dev-api.riff-tech.com/v1/checkout");
    expect(result.url).toContain("softwareId=test-software");
    expect(result.url).toContain("licenseKey=TEST-LICENSE-KEY");
    expect(result.url).toContain("testMode=true");
  });
});
