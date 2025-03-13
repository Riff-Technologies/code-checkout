import { generateCheckoutUrl } from "../checkout";
import { createApiClient } from "../api";
import { DEFAULT_CONFIG } from "../constants";

// Mock the license key generation to make tests deterministic
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  generateLicenseKey: jest.fn().mockReturnValue("TEST-LICENSE-KEY"),
}));

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
    await expect(
      // @ts-expect-error: Intentionally missing required property for test
      generateCheckoutUrl({})
    ).rejects.toThrow("testMode must be explicitly set");
  });

  test("generateCheckoutUrl should call the API and return the checkout URL", async () => {
    const result = await generateCheckoutUrl({
      softwareId: "test-software",
      testMode: false,
      successUrl: "https://test.com/success",
      cancelUrl: "https://test.com/cancel",
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
    await generateCheckoutUrl({
      softwareId: "test-software",
      testMode: true,
    });

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
    const customSuccessUrl = "https://custom-success.com";
    const customCancelUrl = "https://custom-cancel.com";

    await generateCheckoutUrl({
      softwareId: "test-software",
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
    const customLicenseKey = "CUSTOM-LICENSE-KEY";

    await generateCheckoutUrl({
      softwareId: "test-software",
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
    // Mock API client to throw an error
    const mockGet = jest.fn().mockRejectedValue(new Error("API error"));
    (createApiClient as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    const result = await generateCheckoutUrl({
      softwareId: "test-software",
      testMode: true,
    });

    // Verify the result contains a fallback URL
    expect(result.licenseKey).toBe("TEST-LICENSE-KEY");
    expect(result.url).toContain(DEFAULT_CONFIG.baseUrl);
    expect(result.url).toContain("softwareId=test-software");
    expect(result.url).toContain("licenseKey=TEST-LICENSE-KEY");
    expect(result.url).toContain("testMode=true");
  });
});
