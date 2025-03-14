/**
 * Server usage example for the code-checkout package
 * This example demonstrates how to use the package in a Node.js server environment
 */
import express from "express";
import {
  logAnalyticsEvent,
  validateLicense,
  generateCheckoutUrl,
  generateLicenseKey,
} from "@riff-tech/code-checkout";

// Define types for our API responses
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type ValidationResponse = {
  isValid: boolean;
  message: string;
};

/**
 * Example class demonstrating a server-based license management system
 */
class ServerLicenseManager {
  private readonly softwareId: string;
  private readonly app: express.Application;

  constructor() {
    this.softwareId = "riff-tech.testmystuff";
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Set up Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
  }

  /**
   * Set up API routes
   */
  private setupRoutes(): void {
    // Validate a license
    this.app.post("/api/validate-license", async (req, res) => {
      const { licenseKey } = req.body;

      if (!licenseKey) {
        this.sendResponse(res, {
          success: false,
          error: "License key is required",
        });
        return;
      }

      try {
        const result = await validateLicense({
          softwareId: this.softwareId,
          licenseKey,
          forceOnlineValidation: true,
          environment: {
            ipAddress: req.ip,
            userAgent: req.get("user-agent"),
          },
        });

        // Log the validation attempt
        await this.logEvent("license.validate", licenseKey);

        const response: ValidationResponse = {
          isValid: result.isValid,
          message: result.isValid
            ? "License validated"
            : result.reason || "Invalid license",
        };

        this.sendResponse(res, { success: true, data: response });
      } catch (error) {
        console.error("License validation error:", error);
        this.sendResponse(res, {
          success: false,
          error: "Error validating license",
        });
      }
    });

    // Generate a checkout URL
    this.app.post("/api/create-checkout", async (req, res) => {
      try {
        const licenseKey = generateLicenseKey();
        const { url } = await generateCheckoutUrl({
          softwareId: this.softwareId,
          testMode: true,
          licenseKey,
          name: "Example Software",
        });

        // Log the checkout attempt
        await this.logEvent("checkout.start");

        this.sendResponse(res, {
          success: true,
          data: { licenseKey, checkoutUrl: url },
        });
      } catch (error) {
        console.error("Checkout error:", error);
        this.sendResponse(res, {
          success: false,
          error: "Error generating checkout URL",
        });
      }
    });
  }

  /**
   * Log an analytics event
   */
  private async logEvent(
    commandId: string,
    licenseKey?: string
  ): Promise<void> {
    try {
      await logAnalyticsEvent({
        softwareId: this.softwareId,
        commandId,
        licenseKey,
      });
    } catch (error) {
      console.error("Analytics logging error:", error);
    }
  }

  /**
   * Helper method to send consistent API responses
   */
  private sendResponse<T>(
    res: express.Response,
    response: ApiResponse<T>
  ): void {
    res.json(response);
  }

  /**
   * Start the server
   */
  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

// Start the server when this file is run directly
if (require.main === module) {
  const server = new ServerLicenseManager();
  server.start(3000);
}
