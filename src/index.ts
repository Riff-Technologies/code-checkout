/**
 * CodeCheckout - License and payment management for software
 * @packageDocumentation
 */

// Export public API
export { logAnalyticsEvent } from "./analytics";
export { validateLicense } from "./license";
export { generateCheckoutUrl } from "./checkout";
export {
  generateMachineId,
  generateSessionId,
  generateLicenseKey,
} from "./utils";

// Export types
export {
  CodeCheckoutConfig,
  AnalyticsEventParams,
  AnalyticsEventResponse,
  ValidateLicenseParams,
  ValidateLicenseResponse,
  GenerateCheckoutUrlParams,
  GenerateCheckoutUrlResponse,
} from "./types";
