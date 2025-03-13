# code-checkout 🚀

[![npm version](https://badge.fury.io/js/@riff-tech%2Fcode-checkout-vscode.svg)](https://badge.fury.io/js/@riff-tech%2Fcode-checkout-vscode)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> A robust, developer-friendly platform for seamless license management, analytics tracking, and checkout integration in JavaScript/TypeScript projects.

## ✨ Features

- 🔒 **Secure License Validation** with offline-first caching
- 📊 **Analytics Tracking** for user actions and commands
- 🛒 **Checkout Integration** with customizable success/cancel flows
- 💻 **Cross-Platform Support** for all JavaScript and TypeScript projects
- 🔋 **Battery-Included** with TypeScript types and comprehensive documentation

## 🚀 Quick Start

### Installation

```bash
npm install @riff-tech/code-checkout
```

## 📖 Usage Guide

### Analytics Tracking

Track user actions and commands with ease:

```typescript
import { logAnalyticsEvent } from "@riff-tech/code-checkout";

// Track a user action
await logAnalyticsEvent({
  softwareId: "your-software-id", // The unique identifier for your software, e.g. com.mypublisher.mysoftware
  commandId: "user.login", // The unique identifier for your command to track its usage
  licenseKey: "USER_LICENSE_KEY", // Optional as it will be cached automatically
});
```

### License Validation

Implement secure license validation with built-in offline caching:

```typescript
import { validateLicense } from "@riff-tech/code-checkout";

// Validate a license
const result = await validateLicense({
  licenseKey: "USER_LICENSE_KEY", // Optional as it will be cached automatically
  softwareId: "your-software-id",
  forceOnlineValidation: false, // Optional, defaults to false. If `true` the license will skip the cache and validate against the server
  cacheDurationInHours: 24, // Optional, defaults to 24. Grace period for offline usage
});

if (result.isValid) {
  // License is valid
  console.log("License is valid");
} else {
  // License is invalid
  console.log("License is invalid:", result.reason);
}
```

### Checkout URL Generation

Create customized checkout experiences for your users:

```typescript
import { generateCheckoutUrl } from "@riff-tech/code-checkout";

const appDisplayName = "Example App";
const appUri = "vscode://"; // Optional, but this enables a button that can redirect back to your app
const successUrl = "https://mysite.com"; // Optional, but can be used to show your website after purchase

const licenseKeyToActivate = generateLicenseKey(); // Optionally generate a license key and pass it to `generateCheckoutUrl` for activation after checkout success

// Generate a checkout URL and get the licenseKey that will be activated
const { licenseKey, url } = generateCheckoutUrl({
  softwareId: "your-software-id",
  successUrl: `https://codecheckout.dev/activate?key={licenseKey}&name={appDisplayName}&redirectUri={appUri}`, // Optional. Default is a page where the license and app name are shown. The query params are automatically attached to the default or custom `successUrl`
  cancelUrl: "https://riff-tech.com/codecheckout", // Optional. Default is shown.
  testMode: false, // Optional. Creates a test checkout session where no charges are incurred
});

// Redirect the user to the checkout URL
https: window.location.href = url;
```

## 📚 API Reference

### Analytics Tracking

```typescript
logAnalyticsEvent({
  softwareId: string;
  commandId: string;
  licenseKey?: string;
  machineId?: string;
  sessionId?: string;
  timestamp?: string;
  metadata?: Record<string, unknown>; // Additional data you want to track
}): Promise<{ success: boolean }>;
```

### License Validation

```typescript
validateLicense({
  softwareId: string;
  licenseKey?: string;
  machineId?: string;
  sessionId?: string;
  environment?: object;
  forceOnlineValidation?: boolean;
  cacheDurationInHours?: number;
}): Promise<{ isValid: boolean, reason?: string }>;
```

### Checkout URL Generation

```typescript
generateCheckoutUrl({
  softwareId: string;
  successUrl?: string;
  cancelUrl?: string;
  testMode?: boolean;
}): { licenseKey: string; url: string };
```

## 🎯 Examples

Explore our comprehensive examples in the `/examples` directory:

- 🔨 **Basic Usage Example**: Simple TypeScript program demonstrating core functionality
- 🌐 **Browser Example**: Modern implementation using Vite
- 🖥️ **Node.js Server Example**: Server-side implementation with Express

Each example comes with detailed documentation and step-by-step setup instructions.

## 🤝 Contributing

We welcome contributions! Feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Riff-Technologies/code-checkout)
- [Documentation](https://github.com/Riff-Technologies/code-checkout/tree/main/examples)
- [Issue Tracker](https://github.com/Riff-Technologies/code-checkout/issues)
