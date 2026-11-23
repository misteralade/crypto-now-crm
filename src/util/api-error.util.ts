import axios from 'axios';

export const HTTP_STATUS = { TOO_MANY_REQUESTS: 429 } as const;
const PROVIDER_RATE_LIMIT_ERROR_TYPE = 'provider_rate_limit';
const LEGACY_PROVIDER_RATE_LIMIT = /\bHTTP\s+429\b/i;
const RATE_LIMIT_MESSAGE = 'Too many requests. Wait a few minutes, then try again.';
const PROVIDER_RATE_LIMIT_MESSAGE = 'The network provider is limiting requests. Wait a few minutes, then try again.';

export class ApiRequestError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export function toApiRequestError(error: unknown): Error {
  if (!axios.isAxiosError(error)) return new Error('An unexpected error occurred');
  const status = error.response?.status;
  const payload = error.response?.data;
  if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
    const message = payload?.error?.type === PROVIDER_RATE_LIMIT_ERROR_TYPE && typeof payload.message === 'string'
      ? payload.message
      : RATE_LIMIT_MESSAGE;
    return new ApiRequestError(message, status);
  }
  return new ApiRequestError(payload?.message || payload?.error?.message || error.message, status);
}

export function formatSweepFailure(message: string): string {
  return LEGACY_PROVIDER_RATE_LIMIT.test(message) ? PROVIDER_RATE_LIMIT_MESSAGE : message;
}
