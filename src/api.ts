import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { getConfig } from "./config";
import { CodeCheckoutConfig } from "./types";

/**
 * API client for making HTTP requests to the CodeCheckout API
 */
export class ApiClient {
  private client: AxiosInstance;
  private config: CodeCheckoutConfig;

  /**
   * Create a new API client
   * @param config - Configuration options for the API client
   */
  constructor(config: CodeCheckoutConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  /**
   * Make a GET request to the API
   * @param path - The API endpoint path
   * @param params - Query parameters
   * @param options - Additional request options
   * @returns The response data
   */
  public async get<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.get<T>(path, {
        ...options,
        params,
      });
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * Make a POST request to the API
   * @param path - The API endpoint path
   * @param data - Request body data
   * @param options - Additional request options
   * @returns The response data
   */
  public async post<T>(
    path: string,
    data?: Record<string, unknown>,
    options?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await this.client.post<T>(path, data, options);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param error - The error object
   */
  private handleApiError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      console.error(
        `CodeCheckout API Error: ${error.response?.status} ${error.response?.statusText}`,
        error.response?.data
      );
    } else {
      console.error("CodeCheckout API Error:", error);
    }
  }
}

/**
 * Create an API client with the current configuration
 * @param configOverrides - Optional configuration overrides
 * @returns An API client instance
 */
export function createApiClient(
  configOverrides?: Partial<CodeCheckoutConfig>
): ApiClient {
  const config = getConfig(configOverrides);
  return new ApiClient(config);
}
