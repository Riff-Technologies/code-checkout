/**
 * Browser usage example for the CodeCheckout package
 * This example demonstrates how to use the package in a client-side web application
 */
import {
  logAnalyticsEvent,
  validateLicense,
  generateCheckoutUrl,
  generateLicenseKey,
} from "code-checkout";

// Define types for our example
type LicenseStatus = {
  isValid: boolean;
  message: string;
};

/**
 * Example class demonstrating a browser-based license management system
 */
class BrowserLicenseManager {
  private readonly softwareId: string;
  private licenseKey: string | null = "M7XQPSBU-LI48MAOQR2";
  private licenseStatus: LicenseStatus;

  constructor() {
    this.softwareId = "riff-tech.testmystuff";
    this.licenseStatus = { isValid: false, message: "License not validated" };
  }

  /**
   * Initialize the license manager and validate any stored license
   */
  public async initialize(): Promise<void> {
    if (this.licenseKey) {
      await this.validateStoredLicense();
    }
    this.attachEventListeners();
  }

  /**
   * Validate the stored license key
   */
  private async validateStoredLicense(): Promise<void> {
    try {
      const result = await validateLicense({
        softwareId: this.softwareId,
        licenseKey: this.licenseKey as string,
        forceOnlineValidation: true,
        environment: {
          ipAddress: await this.getClientIp(),
          userAgent: navigator.userAgent,
        },
      });

      this.licenseStatus = {
        isValid: result.isValid,
        message: result.isValid
          ? "License validated"
          : result.reason || "Invalid license",
      };

      // Log the validation attempt
      await this.logEvent("license.validate");
    } catch (error) {
      this.licenseStatus = {
        isValid: false,
        message: "Error validating license",
      };
      console.error("License validation error:", error);
    }

    this.updateUI();
  }

  /**
   * Initiate the checkout process
   */
  public async startCheckout(): Promise<void> {
    try {
      const licenseKey = generateLicenseKey();
      const { url } = await generateCheckoutUrl({
        softwareId: this.softwareId,
        testMode: true,
        licenseKey,
        name: "My Software",
        redirectUri: "https://www.google.com",
      });

      // Log the checkout attempt
      await this.logEvent("checkout.start");

      // Redirect to checkout
      window.location.href = url;
    } catch (error) {
      console.error("Checkout error:", error);
      this.updateUI("Error starting checkout process");
    }
  }

  /**
   * Log an analytics event
   */
  private async logEvent(commandId: string): Promise<void> {
    try {
      await logAnalyticsEvent({
        softwareId: this.softwareId,
        commandId,
        licenseKey: this.licenseKey || undefined,
        metadata: {
          userAgent: navigator.userAgent,
        },
      });
    } catch (error) {
      console.error("Analytics logging error:", error);
    }
  }

  /**
   * Get the client's IP address using a service
   * Note: In a real application, you might want to use a more reliable method
   */
  private async getClientIp(): Promise<string> {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error getting IP:", error);
      return "unknown";
    }
  }

  /**
   * Attach event listeners to UI elements
   */
  private attachEventListeners(): void {
    const checkoutButton = document.getElementById("startCheckout");
    const validateButton = document.getElementById("validateLicense");

    if (checkoutButton) {
      checkoutButton.addEventListener("click", () => this.startCheckout());
    }

    if (validateButton) {
      validateButton.addEventListener("click", () =>
        this.validateStoredLicense()
      );
    }
  }

  /**
   * Update the UI with the current license status
   */
  private updateUI(message?: string): void {
    const statusElement = document.getElementById("licenseStatus");
    if (statusElement) {
      statusElement.textContent = message || this.licenseStatus.message;
      statusElement.className = this.licenseStatus.isValid
        ? "valid"
        : "invalid";
    }
  }
}

// Initialize the license manager when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const manager = new BrowserLicenseManager();
  manager.initialize().catch(console.error);
});
