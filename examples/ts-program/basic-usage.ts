/**
 * Basic usage example for the CodeCheckout package
 */
import {
  configure,
  logAnalyticsEvent,
  validateLicense,
  generateCheckoutUrl,
  generateLicenseKey,
} from "../../src";

// Configure the package globally
configure({
  softwareId: "riff-tech.testmystuff",
  baseUrl: "https://dev-api.riff-tech.com/v1",
  defaultSuccessUrl: "https://example.com/activate",
  defaultCancelUrl: "https://example.com",
});

/**
 * Example of tracking an analytics event using global config
 * Recommend a fire-and-forget approach - no awaiting response
 */
async function trackAnalyticsEvent(): Promise<void> {
  try {
    const result = await logAnalyticsEvent({
      commandId: "user.login",
      licenseKey: "EXAMPLE-LICENSE-KEY",
    });

    console.log("Analytics event logged:", result.success);
  } catch (error) {
    console.error("Error logging analytics event:", error);
  }
}

/**
 * Example of tracking an analytics event without configuring the package first
 * Recommend a fire-and-forget approach - no awaiting response
 */
async function trackAnalyticsEventNoConfig(): Promise<void> {
  try {
    const result = await logAnalyticsEvent({
      commandId: "user.login",
      licenseKey: "EXAMPLE-LICENSE-KEY",
      softwareId: "riff-tech.testmystuff",
    });

    console.log("Analytics event logged:", result.success);
  } catch (error) {
    console.error("Error logging analytics event:", error);
  }
}

/**
 * Example of validating a license using global config
 */
async function checkLicense(): Promise<void> {
  try {
    const result = await validateLicense({
      licenseKey: "M7XQPSBU-LI48MAOQR2",
      forceOnlineValidation: false,
      environment: {
        // optional info to store about the license use
        ipAddress: "127.0.0.1",
      },
    });

    if (result.isValid) {
      console.log("License is valid");
    } else {
      console.log("License is invalid:", result.reason);
    }
  } catch (error) {
    console.error("Error validating license:", error);
  }
}

/**
 * Example of validating a license without configuring the package first
 */
async function checkLicenseNoConfig(): Promise<void> {
  try {
    const result = await validateLicense({
      softwareId: "riff-tech.testmystuff",
      licenseKey: "M7XQPSBU-LI48MAOQR2",
      forceOnlineValidation: false,
      environment: {
        // optional info to store about the license use
        ipAddress: "127.0.0.1",
      },
    });

    if (result.isValid) {
      console.log("License is valid");
    } else {
      console.log("License is invalid:", result.reason);
    }
  } catch (error) {
    console.error("Error validating license:", error);
  }
}

/**
 * Example of generating a checkout URL with global config
 */
async function createCheckoutLink(): Promise<void> {
  try {
    const licenseKey = generateLicenseKey();
    const successUrl = "https://example.com/success";
    const cancelUrl = "https://example.com/cancel";

    const { url } = await generateCheckoutUrl({
      testMode: true, // Uses a test checkout endpoint where no charges are processed
      licenseKey,
      successUrl,
      cancelUrl,
    });

    console.log("Generated license key:", licenseKey);
    console.log("Checkout URL:", url);

    // In a real application, you would redirect the user to this URL
    // window.location.href = url;
  } catch (error) {
    console.error("Error generating checkout URL:", error);
  }
}

/**
 * Example of generating a checkout URL without configuring the package first
 */
async function createCheckoutLinkNoConfig(): Promise<void> {
  try {
    const licenseKey = generateLicenseKey();
    const successUrl = "https://example.com/success";
    const cancelUrl = "https://example.com/cancel";

    const { url } = await generateCheckoutUrl({
      softwareId: "riff-tech.testmystuff",
      testMode: true, // Uses a test checkout endpoint where no charges are processed
      licenseKey,
      successUrl,
      cancelUrl,
    });

    console.log("Generated license key:", licenseKey);
    console.log("Checkout URL:", url);

    // In a real application, you would redirect the user to this URL
    // window.location.href = url;
  } catch (error) {
    console.error("Error generating checkout URL:", error);
  }
}

// Run the examples
(async (): Promise<void> => {
  console.log("Running CodeCheckout examples...");

  // Uncomment these lines to run the examples
  trackAnalyticsEvent();
  trackAnalyticsEventNoConfig();
  await checkLicense();
  await checkLicenseNoConfig();
  await createCheckoutLink();
  await createCheckoutLinkNoConfig();
  console.log("Examples completed");
})().catch((error) => {
  console.error("Error running examples:", error);
});
