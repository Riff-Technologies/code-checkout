# CodeCheckout

CodeCheckout is a simple, reliable npm package for analytics tracking, license validation with caching, and checkout URL generation, configurable for use across all JavaScript and TypeScript projects.

## Installation

```bash
npm install @riff-tech/code-checkout
```

## Usage

### Configuration

You can configure the package globally:

```typescript
import { configure } from "@riff-tech/code-checkout";

configure({
  softwareId: "your-software-id",
  defaultSuccessUrl: "https://your-app.com/activate",
  defaultCancelUrl: "https://your-app.com",
});
```

### Analytics Tracking

Track user actions and commands:

```typescript
import { logAnalyticsEvent } from "@riff-tech/code-checkout";

// Track a user action
await logAnalyticsEvent({
  softwareId: "your-software-id", // Optional if configured globally
  commandId: "user.login",
  licenseKey: "USER_LICENSE_KEY", // Optional
});
```

### License Validation

Validate a license key with offline-first caching:

```typescript
import { validateLicense } from "@riff-tech/code-checkout";

// Validate a license
const result = await validateLicense({
  licenseKey: "USER_LICENSE_KEY",
  softwareId: "your-software-id", // Optional if configured globally
  forceOnlineValidation: false, // Optional, defaults to false
  cacheDurationInHours: 24, // Optional, defaults to 24
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

Generate a checkout URL for your software:

```typescript
import { generateCheckoutUrl } from "@riff-tech/code-checkout";

// Generate a checkout URL
const { licenseKey, url } = generateCheckoutUrl({
  softwareId: "your-software-id", // Optional if configured globally
  successUrl: "https://your-app.com/activate", // Optional if configured globally
  cancelUrl: "https://your-app.com", // Optional if configured globally
  testMode: false, // Required
});

// Redirect the user to the checkout URL
window.location.href = url;
```

## API Reference

### Configuration

```typescript
configure({
  softwareId: string;
  defaultSuccessUrl?: string;
  defaultCancelUrl?: string;
});
```

### Analytics Tracking

```typescript
logAnalyticsEvent({
  softwareId: string;
  commandId: string;
  licenseKey?: string;
  machineId?: string;
  sessionId?: string;
  timestamp?: string;
}): Promise<{ success: boolean }>;
```

### License Validation

```typescript
validateLicense({
  licenseKey: string;
  softwareId?: string;
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
  softwareId?: string;
  successUrl?: string;
  cancelUrl?: string;
  testMode: boolean;
}): { licenseKey: string; url: string };
```

## License

MIT
