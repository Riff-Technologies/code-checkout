import { generateCheckoutUrl } from "../checkout";
import { getConfig } from "../config";

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

describe("Checkout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("generateCheckoutUrl should throw error if testMode is not set", () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
    });

    expect(() => {
      // @ts-expect-error: Intentionally missing required property for test
      generateCheckoutUrl({});
    }).toThrow("testMode must be explicitly set");
  });

  test("generateCheckoutUrl should generate a URL with default values", () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
      baseUrl: "https://api.riff-tech.com/v1",
      defaultSuccessUrl: "https://test.com/success",
      defaultCancelUrl: "https://test.com/cancel",
    });

    const result = generateCheckoutUrl({ testMode: false });

    expect(result.licenseKey).toBe("TEST-LICENSE-KEY");
    expect(result.url).toContain("https://api.riff-tech.com/v1/checkout");
    expect(result.url).toContain("softwareId=test-software");
    expect(result.url).toContain("licenseKey=TEST-LICENSE-KEY");
    expect(result.url).toContain("successUrl=https%3A%2F%2Ftest.com%2Fsuccess");
    expect(result.url).toContain("cancelUrl=https%3A%2F%2Ftest.com%2Fcancel");
    expect(result.url).not.toContain("testMode=true");
  });

  test("generateCheckoutUrl should include testMode parameter when true", () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
    });

    const result = generateCheckoutUrl({ testMode: true });

    expect(result.url).toContain("testMode=true");
  });

  test("generateCheckoutUrl should use provided URLs over defaults", () => {
    // Mock getConfig to return a valid configuration
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: "test-software",
      defaultSuccessUrl: "https://default-success.com",
      defaultCancelUrl: "https://default-cancel.com",
    });

    const customSuccessUrl = "https://custom-success.com";
    const customCancelUrl = "https://custom-cancel.com";

    const result = generateCheckoutUrl({
      testMode: false,
      successUrl: customSuccessUrl,
      cancelUrl: customCancelUrl,
    });

    expect(result.url).toContain(
      `successUrl=${encodeURIComponent(customSuccessUrl)}`
    );
    expect(result.url).toContain(
      `cancelUrl=${encodeURIComponent(customCancelUrl)}`
    );
  });

  test("generateCheckoutUrl should use provided softwareId over configured one", () => {
    // Mock getConfig to return a valid configuration with the provided softwareId
    const customSoftwareId = "custom-software";
    (getConfig as jest.Mock).mockReturnValue({
      softwareId: customSoftwareId,
    });

    const result = generateCheckoutUrl({
      testMode: false,
      softwareId: customSoftwareId,
    });

    expect(result.url).toContain(`softwareId=${customSoftwareId}`);
  });
});
