import { CodeCheckoutConfig } from "./types";

/**
 * Default configuration values for the CodeCheckout package
 */
const DEFAULT_CONFIG: Partial<CodeCheckoutConfig> = {
  baseUrl: "https://api.riff-tech.com/v1",
  defaultSuccessUrl: "https://codecheckout.dev/activate",
  defaultCancelUrl: "https://codecheckout.dev",
};

/**
 * Global configuration object for the CodeCheckout package
 */
let globalConfig: CodeCheckoutConfig | null = null;

/**
 * Configure the CodeCheckout package with global settings
 * @param config - Configuration options for the CodeCheckout package
 * @throws Error if softwareId is not provided
 */
export function configure(config: CodeCheckoutConfig): void {
  if (!config.softwareId) {
    throw new Error("softwareId is required for CodeCheckout configuration");
  }

  globalConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
}

/**
 * Get the current configuration, merging global config with provided overrides
 * @param overrides - Optional configuration overrides
 * @returns The merged configuration
 * @throws Error if no configuration has been set and no softwareId is provided in overrides
 */
export function getConfig(
  overrides?: Partial<CodeCheckoutConfig>
): CodeCheckoutConfig {
  // If we have overrides with softwareId, we can use that even without global config
  if (overrides?.softwareId && !globalConfig) {
    return {
      ...DEFAULT_CONFIG,
      ...overrides,
    } as CodeCheckoutConfig;
  }

  // If we have no global config and no valid overrides, throw an error
  if (!globalConfig) {
    throw new Error(
      "CodeCheckout has not been configured. Call configure() first or provide softwareId in method options."
    );
  }

  // Merge global config with any overrides
  if (overrides) {
    return {
      ...globalConfig,
      ...overrides,
    };
  }

  return globalConfig;
}

/**
 * Reset the global configuration (primarily for testing)
 */
export function resetConfig(): void {
  globalConfig = null;
}
