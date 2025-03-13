/**
 * Basic usage example for the CodeCheckout package
 */
import {
  logAnalyticsEvent,
  validateLicense,
  generateCheckoutUrl,
  generateLicenseKey,
} from "../../src";

/**
 * Example of tracking an analytics event
 * Recommend a fire-and-forget approach - no awaiting response
 */
async function trackAnalyticsEvent(): Promise<void> {
  try {
    const result = await logAnalyticsEvent({
      softwareId: "riff-tech.testmystuff",
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
 * Example of generating a checkout URL
 */
async function createCheckoutLink(): Promise<void> {
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
  await checkLicense();
  await createCheckoutLink();
  console.log("Examples completed");
})().catch((error) => {
  console.error("Error running examples:", error);
});
