/**
 * Configuration options for the CodeCheckout package
 */
export interface CodeCheckoutConfig {
  /** Unique identifier for the software using CodeCheckout */
  softwareId: string;
  /** Base URL for the CodeCheckout API */
  baseUrl?: string;
  /** Default success URL for checkout redirects */
  defaultSuccessUrl?: string;
  /** Default cancel URL for checkout redirects */
  defaultCancelUrl?: string;
}

/**
 * Parameters for logging analytics events
 */
export interface AnalyticsEventParams {
  /** Identifier for the command or action being tracked */
  commandId: string;
  /** Unique identifier for the software using CodeCheckout */
  softwareId?: string;
  /** License key associated with the software */
  licenseKey?: string;
  /** Unique identifier for the machine running the software */
  machineId?: string;
  /** Unique identifier for the current session */
  sessionId?: string;
  /** Timestamp for when the event occurred */
  timestamp?: string;
}

/**
 * Response from logging an analytics event
 */
export interface AnalyticsEventResponse {
  /** Whether the event was successfully logged */
  success: boolean;
}

/**
 * Parameters for validating a license
 */
export interface ValidateLicenseParams {
  /** License key to validate */
  licenseKey?: string;
  /** Unique identifier for the software using CodeCheckout */
  softwareId?: string;
  /** Unique identifier for the machine running the software */
  machineId?: string;
  /** Unique identifier for the current session */
  sessionId?: string;
  /** Environment information for validation context */
  environment?: Record<string, unknown>;
  /** Whether to force an online validation, bypassing the cache */
  forceOnlineValidation?: boolean;
  /** Duration in hours to cache validation results */
  cacheDurationInHours?: number;
}

/**
 * Response from validating a license
 */
export interface ValidateLicenseResponse {
  /** Whether the license is valid */
  isValid: boolean;
  /** Reason for license invalidity, if applicable */
  reason?: string;
}

/**
 * Parameters for generating a checkout URL
 */
export interface GenerateCheckoutUrlParams {
  /** Unique identifier for the software using CodeCheckout */
  softwareId?: string;
  /** URL to redirect to after successful checkout */
  successUrl?: string;
  /** URL to redirect to if checkout is cancelled */
  cancelUrl?: string;
  /** Whether to use test mode for checkout */
  testMode: boolean;
  /** Optionally pass in a license key, and if omitted it will be generated */
  licenseKey?: string;
}

/**
 * Response from generating a checkout URL
 */
export interface GenerateCheckoutUrlResponse {
  /** Generated license key */
  licenseKey: string;
  /** Checkout URL */
  url: string;
}

/**
 * Cached license validation data
 */
export interface CachedValidation {
  /** Whether the license is valid */
  isValid: boolean;
  /** Reason for license invalidity, if applicable */
  reason?: string;
  /** Timestamp when the validation was cached */
  timestamp: number;
}

/**
 * Cache storage interface for license validation
 */
export interface CacheStorage {
  /** Get cached validation data for a license key */
  get(key: string): Promise<CachedValidation | null>;
  /** Set cached validation data for a license key */
  set(key: string, data: CachedValidation): Promise<void>;
  /** Clear all cached validation data */
  clear(): Promise<void>;
}
