import { generateCheckoutUrl } from "../checkout";
import { createApiClient } from "../api";

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
        successUrl: "https://test.com/success?key=TEST-LICENSE-KEY",
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
    const customSuccessUrl = "https://custom-success.com/activate";
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
        successUrl: `${customSuccessUrl}?key=TEST-LICENSE-KEY`,
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
});
