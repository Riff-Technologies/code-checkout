import {
  GenerateCheckoutUrlParams,
  GenerateCheckoutUrlResponse,
} from "./types";
import { getConfig } from "./config";
import { generateLicenseKey } from "./utils";

/**
 * Generate a checkout URL for the CodeCheckout platform
 * @param params - Parameters for generating the checkout URL
 * @returns The generated license key and checkout URL
 */
export function generateCheckoutUrl(
  params: GenerateCheckoutUrlParams
): GenerateCheckoutUrlResponse {
  // Validate testMode is explicitly set
  if (params.testMode === undefined) {
    throw new Error(
      "testMode must be explicitly set for checkout URL generation"
    );
  }

  // Get configuration with any overrides
  const config = getConfig({
    ...(params.softwareId && { softwareId: params.softwareId }),
  });

  // Generate a unique license key
  const licenseKey = generateLicenseKey();

  // Use provided URLs or defaults from config
  const successUrl = params.successUrl || config.defaultSuccessUrl;
  const cancelUrl = params.cancelUrl || config.defaultCancelUrl;

  // Build the checkout URL
  const baseUrl = config.baseUrl || "https://api.riff-tech.com";
  const checkoutPath = "v1/checkout";

  // Create URL with query parameters
  const url = new URL(checkoutPath, baseUrl);
  url.searchParams.append("softwareId", config.softwareId);
  url.searchParams.append("licenseKey", licenseKey);

  if (successUrl) {
    url.searchParams.append("successUrl", successUrl);
  }

  if (cancelUrl) {
    url.searchParams.append("cancelUrl", cancelUrl);
  }

  if (params.testMode) {
    url.searchParams.append("testMode", "true");
  }

  return {
    licenseKey,
    url: url.toString(),
  };
}
