import {
  fetchWithCredentials,
  handleApiResponse,
  createTimeoutError,
  isApiError,
  isTimeoutError,
} from "@/utils/fetchWithCredentials";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    context?: any;
  };
  message?: string;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  skipRetry?: boolean;
  onUploadProgress?: (progress: number) => void;
}

const DEFAULT_TIMEOUT = 8000;
const DEFAULT_RETRIES = 2;

export abstract class BaseService {
  protected baseUrl: string;
  private readonly isAuthenticated: boolean;

  constructor(baseUrl: string = "/api", authenticated: boolean = false) {
    if (!baseUrl) throw new Error("Base URL is required");
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.isAuthenticated = authenticated;
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    retries: number = DEFAULT_RETRIES,
    skipRetry: boolean = false,
  ): Promise<T> {
    if (skipRetry) return operation();

    let lastError: Error;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        const shouldNotRetry =
          (isApiError(error) && error.status >= 400 && error.status < 500) ||
          isTimeoutError(error) ||
          (error instanceof Error && error.name === "AbortError");

        if (shouldNotRetry || attempt === retries) throw error;

        await new Promise((resolve) => 
          setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000))
        );
      }
    }
    throw lastError!;
  }

  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const rawData = await handleApiResponse<any>(response);

      // If backend sends a structured response with "success" field, return it as-is
      if (rawData && typeof rawData === "object" && "success" in rawData) {
        return rawData as ApiResponse<T>;
      }

      // If backend sends raw data without structure, wrap it in success response
      return { success: true, data: rawData as T };
    } catch (error) {
      if (isApiError(error) && error.body) {
        return error.body as ApiResponse<T>;
      }

      // Fallback for unexpected errors
      return {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: error instanceof Error ? error.message : "An unexpected error occurred",
        },
      };
    }
  }

  private async makeRequest(
    method: string,
    url: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<Response> {
    const timeout = options?.timeout || DEFAULT_TIMEOUT;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const config: RequestInit = {
        method,
        headers: {
          ...(!(data instanceof FormData) && { "Content-Type": "application/json" }),
          ...options?.headers,
        },
        signal: options?.signal || controller.signal,
      };

      if (data && method !== "GET" && method !== "HEAD") {
        config.body = data instanceof FormData ? data : JSON.stringify(data);
      }

      const response = this.isAuthenticated 
        ? await fetchWithCredentials(url, config)
        : await fetch(url, config);

      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof Error && error.name === "AbortError") {
        throw createTimeoutError(timeout);
      }
      throw error;
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint}`;
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, Array.isArray(value) ? value.join(",") : String(value));
      }
    });
    
    const qs = searchParams.toString();
    return qs ? `${url}?${qs}` : url;
  }

  protected async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    
    return this.executeWithRetry(async () => {
      const response = await this.makeRequest("GET", url, undefined, options);
      return this.processResponse<T>(response);
    }, options?.retries, options?.skipRetry);
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.makeRequest("POST", `${this.baseUrl}${endpoint}`, data, options);
      return this.processResponse<T>(response);
    }, options?.retries, options?.skipRetry);
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.makeRequest("PUT", `${this.baseUrl}${endpoint}`, data, options);
      return this.processResponse<T>(response);
    }, options?.retries, options?.skipRetry);
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.makeRequest("PATCH", `${this.baseUrl}${endpoint}`, data, options);
      return this.processResponse<T>(response);
    }, options?.retries, options?.skipRetry);
  }

  protected async delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    return this.executeWithRetry(async () => {
      const response = await this.makeRequest("DELETE", url, undefined, options);
      return this.processResponse<T>(response);
    }, options?.retries, options?.skipRetry);
  }

  protected async deleteWithBody<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry(async () => {
      const response = await this.makeRequest("DELETE", `${this.baseUrl}${endpoint}`, data, options);
      return this.processResponse<T>(response);
    }, options?.retries, options?.skipRetry);
  }

  protected async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions & { onProgress?: (progress: number) => void },
  ): Promise<ApiResponse<T>> {
    const timeout = options?.timeout || DEFAULT_TIMEOUT * 2;

    if (options?.onProgress) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            options.onProgress!(Math.round((event.loaded / event.total) * 100));
          }
        });

        xhr.addEventListener("load", async () => {
          try {
            const response = new Response(xhr.responseText, {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers({
                "Content-Type": xhr.getResponseHeader("Content-Type") || "application/json",
              }),
            });
            resolve(await this.processResponse<T>(response));
          } catch (error) {
            reject(error);
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        const timeoutId = setTimeout(() => {
          xhr.abort();
          reject(createTimeoutError(timeout));
        }, timeout);

        xhr.addEventListener("loadend", () => clearTimeout(timeoutId));

        xhr.open("POST", `${this.baseUrl}${endpoint}`);
        xhr.withCredentials = true;
        xhr.send(formData);
      });
    }

    const response = await this.makeRequest("POST", `${this.baseUrl}${endpoint}`, formData, { ...options, timeout });
    return this.processResponse<T>(response);
  }

  protected async batch<T>(
    requests: Array<{ method: string; endpoint: string; data?: any }>,
  ): Promise<ApiResponse<T[]>> {
    const results = await Promise.all(
      requests.map((req) =>
        this.makeRequest(req.method, `${this.baseUrl}${req.endpoint}`, req.data)
          .then((res) => this.processResponse(res))
      )
    );
    
    return { success: results.every((r) => r.success), data: results as T[] };
  }

  isSuccess(response: ApiResponse<any>): boolean {
    return response.success === true;
  }

  isClientError(response: ApiResponse<any>): boolean {
    return response.error?.code?.startsWith("4") || false;
  }

  isServerError(response: ApiResponse<any>): boolean {
    return response.error?.code?.startsWith("5") || false;
  }
}

export class BasePublicService extends BaseService {
  constructor(baseUrl: string = "/api") {
    super(baseUrl, false);
  }
}

export class BasePrivateService extends BaseService {
  constructor(baseUrl: string = "/api") {
    super(baseUrl, true);
  }
}