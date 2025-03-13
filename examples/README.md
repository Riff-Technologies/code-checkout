# CodeCheckout Examples

This directory contains example applications demonstrating how to use the CodeCheckout package in both browser and server environments.

## Structure

- `browser-usage.ts` - Example of using CodeCheckout in a browser environment
- `server-usage.ts` - Example of using CodeCheckout in a Node.js server environment
- `browser-example.html` - HTML page for demonstrating the browser example
- `basic-usage.ts` - Basic usage examples of the package's core functionality

## Prerequisites

- Node.js 18 or later
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Configure your environment:
   - Make sure you have a valid software ID from Riff-Tech
   - Update the `softwareId` in both example files if needed

## Running the Examples

### Browser Example

1. Start a development server (you can use tools like `vite` or `parcel`):

```bash
npx vite
```

2. Open `browser-example.html` in your browser through the development server
3. Use the buttons to test license validation and checkout functionality

### Server Example

1. Start the server:

```bash
npm run start:server
# or
yarn start:server
```

2. The server will start on port 3000
3. Use the following API endpoints:
   - `POST /api/validate-license` - Validate a license key
   - `POST /api/create-checkout` - Generate a checkout URL

## API Examples

### Validate License (Server)

```bash
curl -X POST http://localhost:3000/api/validate-license \
  -H "Content-Type: application/json" \
  -d '{"licenseKey": "YOUR-LICENSE-KEY"}'
```

### Create Checkout (Server)

```bash
curl -X POST http://localhost:3000/api/create-checkout
```

## Features Demonstrated

- Global package configuration
- License key validation
- Checkout URL generation
- Analytics event logging
- Error handling
- TypeScript type safety
- Browser storage integration
- RESTful API endpoints
- Environment-specific implementations

## Security Notes

- The examples use test mode for checkout - remember to disable this in production
- API endpoints should implement proper authentication in production
- Never expose sensitive configuration in client-side code
- Store license keys securely
- Implement rate limiting for API endpoints in production

## Additional Resources

- [CodeCheckout Documentation](https://docs.riff-tech.com)
- [API Reference](https://api.riff-tech.com/docs)
- [Support](https://support.riff-tech.com)
