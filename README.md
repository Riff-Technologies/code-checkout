# code-checkout 🚀

[![npm version](https://badge.fury.io/js/@riff-tech%2Fcode-checkout.svg)](https://badge.fury.io/js/@riff-tech%2Fcode-checkout)
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

### Prerequisites

Create a [code-checkout account](https://riff-tech.com/sign-up) and create a Software Product. You'll need the `softwareId` that you added to integrate with the code-checkout platform.

### Installation

```bash
npm install @riff-tech/code-checkout
```

## 📖 Usage Guide

> Note: we recommend storing your `softwareId` in an environment variable.

### Command Analytics Tracking

> Note: Analytics are intended to track the usage of your features, not as a replacement for your user-behavior analytics

Track which commands your users are executing with ease:

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

| Parameter     | Type      | Required | Description                                                                                                                                                                |
| ------------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `softwareId`  | `string`  | Yes      | Unique identifier for your software using code-checkout                                                                                                                    |
| `successUrl`  | `string`  | No       | URL to redirect to after successful checkout. Default is a code-checkout activation page. Query parameters for `key`, `name`, and `redirectUri` are automatically appended |
| `cancelUrl`   | `string`  | No       | URL to redirect to if checkout is cancelled. Defaults to code-checkout homepage                                                                                            |
| `testMode`    | `boolean` | No       | When `true`, creates a test checkout session with no charges. Defaults to `false`                                                                                          |
| `licenseKey`  | `string`  | No       | Custom license key to activate after checkout. If omitted, one will be generated                                                                                           |
| `name`        | `string`  | No       | Display name for your software. If provided, appended as query param to `successUrl`                                                                                       |
| `redirectUri` | `string`  | No       | URI to redirect back to your application. If provided, appended as query param to `successUrl`                                                                             |

```typescript
import { generateCheckoutUrl } from "@riff-tech/code-checkout";

const appDisplayName = "Example App";
const successUrl = "https://mysite.com";

const licenseKeyToActivate = generateLicenseKey(); // Optionally generate a license key and pass it to `generateCheckoutUrl` for activation after checkout success

// Generate a checkout URL and get the licenseKey that will be activated
const { licenseKey, url } = generateCheckoutUrl({
  softwareId: "your-software-id",
  successUrl: `https://codecheckout.dev/activate?key={licenseKey}`,
  cancelUrl: "https://riff-tech.com/codecheckout",
  name: appDisplayName,
  redirectUri: successUrl,
  testMode: false,
});

// By default, your users will be redirected after checkout to a license page, like this:
// http://riff-tech.com/activate?key=YOUR-LICENSE-KEY-HERE&name=Your%20Software%20Name&redirectUri=https://your-app.com

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
  environment?: object; // Information about the user's environment, e.g. IDE, version, etc.
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
  name?: string;
  redirectUri: string;
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
