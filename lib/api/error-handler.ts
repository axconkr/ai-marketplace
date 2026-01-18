/**
 * Global API Error Handler
 * Centralized error handling with retry logic, 401 redirects, and user-friendly messages
 */

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
  retryable: boolean;
}

/**
 * Error codes and their user-friendly messages
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  TOKEN_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  INVALID_TOKEN: '유효하지 않은 인증 정보입니다.',

  // Validation errors
  BAD_REQUEST: '잘못된 요청입니다.',
  VALIDATION_ERROR: '입력 정보를 확인해주세요.',
  INVALID_INPUT: '입력값이 올바르지 않습니다.',

  // Resource errors
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  CONFLICT: '이미 존재하는 데이터입니다.',

  // Network errors
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다.',

  // Server errors
  SERVER_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  SERVICE_UNAVAILABLE: '서비스를 일시적으로 사용할 수 없습니다.',

  // Payment errors
  PAYMENT_FAILED: '결제에 실패했습니다.',
  REFUND_FAILED: '환불 처리에 실패했습니다.',
};

/**
 * Determine if an error is retryable
 */
function isRetryableError(status: number, code?: string): boolean {
  // Network errors and timeouts are retryable
  if (status === 0 || code === 'NETWORK_ERROR' || code === 'TIMEOUT_ERROR') {
    return true;
  }

  // 5xx server errors are retryable
  if (status >= 500 && status < 600) {
    return true;
  }

  // 429 (rate limit) is retryable
  if (status === 429) {
    return true;
  }

  return false;
}

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error: ApiError): string {
  // Use custom message from error code
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Use message from server if available
  if (error.message && error.message !== 'An error occurred') {
    return error.message;
  }

  // Fallback based on status code
  if (error.status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  if (error.status === 401) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  if (error.status === 403) {
    return ERROR_MESSAGES.FORBIDDEN;
  }

  if (error.status === 404) {
    return ERROR_MESSAGES.NOT_FOUND;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * Parse error response from fetch
 */
export async function parseErrorResponse(response: Response): Promise<ApiError> {
  let errorData: any = {};

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    } else {
      errorData = { message: await response.text() };
    }
  } catch (e) {
    errorData = { message: response.statusText };
  }

  const apiError: ApiError = {
    code: errorData.error?.code || errorData.code || 'UNKNOWN_ERROR',
    message: errorData.error?.message || errorData.message || response.statusText,
    status: response.status,
    details: errorData.error?.details || errorData.details,
    retryable: isRetryableError(response.status, errorData.error?.code),
  };

  return apiError;
}

/**
 * Create an API error from a network error
 */
export function createNetworkError(error: Error): ApiError {
  return {
    code: 'NETWORK_ERROR',
    message: error.message,
    status: 0,
    retryable: true,
  };
}

/**
 * Handle 401 errors by redirecting to login
 */
export function handle401Error() {
  // Clear authentication tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Redirect to login page with return URL
    const currentPath = window.location.pathname;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

    // Use window.location for full page reload to clear state
    window.location.href = loginUrl;
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Calculate retry delay with exponential backoff
 */
function getRetryDelay(attempt: number, config: RetryConfig): number {
  const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Handle 401 errors immediately (no retry)
      if (response.status === 401) {
        const error = await parseErrorResponse(response);
        handle401Error();
        throw new Error(getUserFriendlyMessage(error));
      }

      // Handle other errors
      if (!response.ok) {
        const error = await parseErrorResponse(response);

        // If not retryable or last attempt, throw error
        if (!error.retryable || attempt === config.maxRetries) {
          throw new Error(getUserFriendlyMessage(error));
        }

        // Store error for potential retry
        lastError = error;
      } else {
        // Success - parse and return response
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        }
        return response as any;
      }
    } catch (error) {
      // Network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError = createNetworkError(error);

        // If last attempt, throw error
        if (attempt === config.maxRetries) {
          throw new Error(getUserFriendlyMessage(networkError));
        }

        lastError = networkError;
      } else {
        // Re-throw non-retryable errors
        throw error;
      }
    }

    // Wait before retry (except on last attempt)
    if (attempt < config.maxRetries && lastError) {
      const delay = getRetryDelay(attempt + 1, config);
      await sleep(delay);
    }
  }

  // If we get here, all retries failed
  throw new Error(
    lastError
      ? getUserFriendlyMessage(lastError)
      : ERROR_MESSAGES.SERVER_ERROR
  );
}

/**
 * Enhanced fetch with automatic error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
  config?: {
    retry?: Partial<RetryConfig>;
    skipAuth?: boolean;
  }
): Promise<T> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const url = `${API_BASE_URL}${endpoint}`;

  // Get access token from localStorage
  const token = typeof window !== 'undefined' && !config?.skipAuth
    ? localStorage.getItem('accessToken')
    : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetchWithRetry<T>(url, {
    ...options,
    headers,
    credentials: 'include',
  }, config?.retry);
}

/**
 * Export error messages for use in components
 */
export { ERROR_MESSAGES };
