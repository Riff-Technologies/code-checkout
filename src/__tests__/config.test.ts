import { configure, getConfig, resetConfig } from "../config";
import { CodeCheckoutConfig } from "../types";

describe("Configuration", () => {
  // Reset configuration before each test
  beforeEach(() => {
    resetConfig();
  });

  test("configure should set global configuration", () => {
    const config = {
      softwareId: "test-software-id",
      baseUrl: "https://dev-api.riff-tech.com/v1",
      defaultSuccessUrl: "https://test.com/success",
      defaultCancelUrl: "https://test.com/cancel",
    };

    configure(config);

    const retrievedConfig = getConfig();
    expect(retrievedConfig).toEqual(config);
  });

  test("configure should throw error if softwareId is not provided", () => {
    expect(() => {
      configure({} as CodeCheckoutConfig);
    }).toThrow("softwareId is required");
  });

  test("getConfig should throw error if not configured and no softwareId override", () => {
    expect(() => {
      getConfig();
    }).toThrow("CodeCheckout has not been configured");
  });

  test("getConfig should use softwareId from overrides if provided", () => {
    const overrides = {
      softwareId: "override-software-id",
    };

    const config = getConfig(overrides);

    expect(config.softwareId).toBe(overrides.softwareId);
    expect(config.baseUrl).toBe("https://api.riff-tech.com/v1"); // Default value
  });

  test("getConfig should merge global config with overrides", () => {
    configure({
      softwareId: "global-software-id",
      baseUrl: "https://dev-api.riff-tech.com/v1",
    });

    const overrides = {
      softwareId: "override-software-id",
    };

    const config = getConfig(overrides);

    expect(config.softwareId).toBe(overrides.softwareId);
    expect(config.baseUrl).toBe("https://dev-api.riff-tech.com/v1");
  });
});
