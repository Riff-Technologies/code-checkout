/**
 * Basic usage example for the CodeCheckout package
 */
import {
  configure,
  logAnalyticsEvent,
  validateLicense,
  generateCheckoutUrl,
  generateLicenseKey,
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
 * @ignore This function is not used in this example but is kept for reference
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function trackAnalyticsEvent(): Promise<void> {
  try {
    const result = await logAnalyticsEvent({
      commandId: "user.login",
      // softwareId: "example-software-id",
      licenseKey: "EXAMPLE-LICENSE-KEY",
    });

    console.log("Analytics event logged:", result.success);
  } catch (error) {
    console.error("Error logging analytics event:", error);
  }
}

/**
 * Example of validating a license
 * @ignore This function is not used in this example but is kept for reference
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
async function createCheckoutLink(): Promise<void> {
  try {
    const licenseKey = generateLicenseKey();
    const successUrl = "https://example.com/success";
    const cancelUrl = "https://example.com/cancel";

    const { url } = await generateCheckoutUrl({
      testMode: true,
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
  // await trackAnalyticsEvent();
  await checkLicense();
  // await createCheckoutLink();

  console.log("Examples completed");
})().catch((error) => {
  console.error("Error running examples:", error);
});
