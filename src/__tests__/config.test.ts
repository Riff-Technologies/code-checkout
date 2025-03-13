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
      defaultSuccessUrl: "https://test.com/success",
      defaultCancelUrl: "https://test.com/cancel",
    };

    configure(config);

    const retrievedConfig = getConfig();
    expect({ ...retrievedConfig, baseUrl: undefined }).toEqual(config);
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
  });

  test("getConfig should merge global config with overrides", () => {
    configure({
      softwareId: "global-software-id",
    });

    const overrides = {
      softwareId: "override-software-id",
    };

    const config = getConfig(overrides);

    expect(config.softwareId).toBe(overrides.softwareId);
  });
});
