import {
  GenerateCheckoutUrlParams,
  GenerateCheckoutUrlResponse,
} from "./types";
import { generateLicenseKey } from "./utils";
import { createApiClient } from "./api";
import { DEFAULT_CONFIG } from "./constants";

/**
 * Generate a checkout URL for the code-checkout platform
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
    // attach `key` always, and attach `name`, and `redirectUri` if they are provided to the successUrl
    const newSuccessUrl = new URL(successUrl);
    newSuccessUrl.searchParams.append("key", licenseKey);

    if (params.name) {
      newSuccessUrl.searchParams.append("name", params.name);
    }
    if (params.redirectUri) {
      const encodedRedirectUri = encodeURIComponent(params.redirectUri);
      newSuccessUrl.searchParams.append("redirectUri", encodedRedirectUri);
    }
    queryParams.successUrl = newSuccessUrl.toString();
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
    throw new Error("Error generating checkout URL");
  }
}
