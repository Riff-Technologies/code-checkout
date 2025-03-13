/**
 * Basic usage example for the CodeCheckout package
 */
import {
  configure,
  logAnalyticsEvent,
  validateLicense,
  generateCheckoutUrl,
} from "../src";

// Configure the package globally
configure({
  softwareId: "riff-tech.testmystuff",
  baseUrl: "https://dev-api.riff-tech.com/v1",
  defaultSuccessUrl: "https://example.com/activate",
  defaultCancelUrl: "https://example.com",
});

/**
 * Example of tracking an analytics event
 */
async function trackAnalyticsEvent(): Promise<void> {
  try {
    const result = await logAnalyticsEvent({
      softwareId: "example-software-id",
      commandId: "user.login",
      licenseKey: "EXAMPLE-LICENSE-KEY",
    });

    console.log("Analytics event logged:", result.success);
  } catch (error) {
    console.error("Error logging analytics event:", error);
  }
}

/**
 * Example of validating a license
 */
async function checkLicense(): Promise<void> {
  try {
    const result = await validateLicense({
      licenseKey: "M7XQPSBU-LI48MAOQR2",
      forceOnlineValidation: false,
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
 * Example of generating a checkout URL
 */
function createCheckoutLink(): void {
  try {
    const { licenseKey, url } = generateCheckoutUrl({
      testMode: true,
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
(async () => {
  console.log("Running CodeCheckout examples...");

  // await trackAnalyticsEvent();
  // await checkLicense();
  createCheckoutLink();

  console.log("Examples completed");
})();
