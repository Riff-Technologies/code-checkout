import {
  GenerateCheckoutUrlParams,
  GenerateCheckoutUrlResponse,
} from "./types";
import { generateLicenseKey } from "./utils";
import { createApiClient } from "./api";
import { DEFAULT_CONFIG } from "./constants";

/**
 * Generate a checkout URL for the CodeCheckout platform
 * @param params - Parameters for generating the checkout URL
 * @returns The generated license key and checkout URL
 */
export async function generateCheckoutUrl(
  params: GenerateCheckoutUrlParams
): Promise<GenerateCheckoutUrlResponse> {
  // Get configuration
  const config = DEFAULT_CONFIG;

  // Generate a unique license key if not provided
  const licenseKey = params.licenseKey || generateLicenseKey();

  // Use provided URLs or defaults from config
  const successUrl = params.successUrl || config.defaultSuccessUrl;
  const cancelUrl = params.cancelUrl || config.defaultCancelUrl;

  // Create API client
  const apiClient = createApiClient();

  // Build query parameters
  const queryParams: Record<string, string | number | boolean> = {
    licenseKey,
  };

  if (successUrl) {
    queryParams.successUrl = successUrl;
  }

  if (cancelUrl) {
    queryParams.cancelUrl = cancelUrl;
  }

  if (params.testMode) {
    queryParams.testMode = true;
  }

  // Call the checkout endpoint to get the checkout URL
  try {
    const response = await apiClient.get<{ url: string }>(
      `/${params.softwareId}/checkout`,
      queryParams
    );

    return {
      licenseKey,
      url: response.url,
    };
  } catch (error) {
    console.error("Error generating checkout URL:", error);

    // Fallback to constructing the URL locally if the API call fails
    const checkoutPath = "v1/checkout";

    // Create URL with query parameters
    const url = new URL(checkoutPath, config.baseUrl);
    url.searchParams.append("softwareId", params.softwareId);
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
}
