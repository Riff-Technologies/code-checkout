prompt

I want to make a typescript package available on npm that developers can install in their projects in order to add support for software licensing and generating checkout session URLs for their users to purchase licenses.

The package will expose these functions that developers can implement to add paywall support and license purchase functionality in their software:

1. Log analytics event should be asynchronous. It should typically be used without awaiting the response, so that it can be sent in the background without blocking. It should be implemented in a such a way that it is non-blocking.
   function: `logAnalyticsEvent`
   Arguments:
   `softwareId: string` (the unique identifier of the software, e.g. com.mypublisher.mysoftware), `commandId: string` (the command that the user attempted to execute), `timestamp: string`, `hasValidLicense?: boolean`, `licenseKey?: string`, `metadata: object`
   returns: `success: boolean`

2. Validate license should be asynchronous. It should validate against the server only when required, and otherwise it should use cached data if possible. By default it should be assumed that the license is valid (unless the argument overrides this default functionality), should store the last date that it was validated against the server, should be configurable with a grace period of days during which it can be used without server validation. If it is assumed to be valid, the function should return the proper values, but it should also perform a non-blocking request to the server to validate the license in the background, and store the result for the next call to the function.
   function: `validateLicense`
   Arguments:
   `licenseKey: string`, `softwareId: string`, `machineId?: string` (should be generated to keep track of how many machines the license is used on), `sessionId?: string` (should be generated per "session" of the use of the application), `environment?: object` (details about where the app is running like OS, IDE, etc.)

3. Get checkout URL should fetch the URL which can be opened to purchase a license. It should generate a new license key in the client application, which will be included in the URL.
   function: `generateCheckoutUrl`
   Arguments:
   `softwareId: string`, `licenseKey: string`, `successUrl?: url` (will default to `https://codecheckout.dev/activate`), `cancelUrl?: url` (will default to `https://codecheckout.dev`), `testMode?: boolean` (if set to `true` it will use the testing checkout URL where no charges are processed)

Generating a license key should be unique, something like this:

```
/**
 * Generates a unique license key
 * @returns A unique license key
 */
export function generateLicenseKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`.toUpperCase();
}
```

The package will need to communicate with my API servers at the base URL:

- development server: https://dev-api.riff-tech.com/v1
- production server: https://api.riff-tech.com/v1

URL endpoints:

Log analytics event:

Request:

```
curl --location '{{baseUrl}}/analytics/events' \
--header 'Content-Type: application/json' \
--data '{
  "extensionId": "riff-tech.testmystuff",
  "commandId": "my-command",
  "timestamp"?: "2025-01-22T00:00:00Z",
  "hasValidLicense"?: true,
  "licenseKey"?: "1234-12345"
  "metadata"?: {
    "category": "Testing",
    "duration": 1000
  }
}'
```

Response:

```
{
    "extensionId": "riff-tech.testmystuff",
    "commandId": "my-command",
    "timestamp": "2025-01-22T00:00:00Z"
}
```

Validate license:

Request:

```
curl --location '{{baseUrl}}/validate' \
--header 'Authorization: Bearer {{licenseKey}}' \
--header 'Content-Type: application/json' \
--data '{
  "machineId"?: "287f2939a9c50697f657cf01de09e91638f3af2fdd9c67ad2c792b84309e83db",
  "sessionId"?: "8c265d40-0bde-454d-ad4e-4c588d66ddd31736701520162",
  "environment"?: {
    "ideVersion": "1.93.1",
    "ideName": "Cursor",
    "extensionVersion": "0.0.1",
    "platform": "darwin",
    "release": "24.1.0"
  },
  "extensionId": "riff-tech.testmystuff"
}'
```

Response:

```
{
    "isValid": true,
    "expiresOn": "2025-12-31T23:59:59Z",
    "message": "License is valid"
}
```

Get Checkout URL:

Request:

```
curl --location '{{baseUrl}}/{{extensionId}}/checkout?licenseKey=12345-1234567&successUrl={{successUrl}}&cancelUrl={{cancelUrl}}&testMode=true' \
--header 'Content-Type: application/json'

Optional query params:
`successUrl`, `cancelUrl`, `testMode`
```

Response:

```
{
    "url": "https://checkout.stripe.com/pay/cs_test"
}
```
