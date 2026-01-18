/**
 * API Client for AI Marketplace
 * Handles all HTTP requests to backend APIs with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get JWT token from localStorage
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseURL}${endpoint}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Build headers with authentication
   */
  private getHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    // Add JSON content type if not set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add auth token if available
    const token = this.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Check if response is ok
    if (!response.ok) {
      const error: any = new Error('API request failed');
      error.status = response.status;

      try {
        const errorData = await response.json();
        error.message = errorData.error?.message || errorData.message || 'Unknown error';
        error.code = errorData.error?.code || 'UNKNOWN_ERROR';
        error.data = errorData;
      } catch {
        error.message = response.statusText || 'Request failed';
      }

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }

      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    // Parse JSON response
    try {
      const data = await response.json();
      return data.data || data;
    } catch {
      return {} as T;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(fetchOptions.headers),
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(fetchOptions.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(fetchOptions.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(fetchOptions.headers),
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(fetchOptions.headers),
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(endpoint: string, formData: FormData, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildURL(endpoint, params);

    // Don't set Content-Type for FormData (browser will set it with boundary)
    const headers = this.getHeaders();
    headers.delete('Content-Type');

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      ...fetchOptions,
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;
