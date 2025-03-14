import { CodeCheckoutConfig } from "./types";

export const DEFAULT_CONFIG: CodeCheckoutConfig = {
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "https://dev-api.riff-tech.com/v1"
      : "https://api.riff-tech.com/v1",
  defaultSuccessUrl: "https://riff-tech.com/activate",
  defaultCancelUrl: "https://riff-tech.com/codecheckout",
};
