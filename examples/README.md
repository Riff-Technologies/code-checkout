# code-checkout Examples

This directory contains example applications demonstrating how to use the code-checkout package in both browser and server environments.

## Structure

- `browser-usage.ts` - Example of using code-checkout in a browser environment
- `server-usage.ts` - Example of using code-checkout in a Node.js server environment
- `basic-usage.ts` - Basic usage examples of the package's core functionality

## Prerequisites

- Node.js 18 or later
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure your environment:
   - Make sure you have a valid software ID from Riff-Tech
   - Update the `softwareId` in both example files if needed

## Running the Examples

### TypeScript program example

1. Run the program with `npm run start:ts-program`

---

### Browser Example

1. Start a development server using `vite`

```bash
npm run start:browser
```

2. Open the localhost page in your browser through the development server
3. Use the buttons to test license validation and checkout functionality

### Server Example

---

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
  -d '{"licenseKey": "M7XQPSBU-LI48MAOQR2"}'
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

- [code-checkout Documentation](https://www.riff-tech.com/docs/guides)
- [Support](mailto:shawn@riff-tech.com)
