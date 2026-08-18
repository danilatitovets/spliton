import { isRetryableHttpStatus } from './is-retryable-http-status';

describe('isRetryableHttpStatus', () => {
  it('marks timeout, rate-limit, and 5xx as retryable', () => {
    expect(isRetryableHttpStatus(408)).toBe(true);
    expect(isRetryableHttpStatus(429)).toBe(true);
    expect(isRetryableHttpStatus(500)).toBe(true);
    expect(isRetryableHttpStatus(503)).toBe(true);
  });

  it('does not mark client/auth/conflict errors as retryable', () => {
    expect(isRetryableHttpStatus(400)).toBe(false);
    expect(isRetryableHttpStatus(401)).toBe(false);
    expect(isRetryableHttpStatus(403)).toBe(false);
    expect(isRetryableHttpStatus(404)).toBe(false);
    expect(isRetryableHttpStatus(409)).toBe(false);
    expect(isRetryableHttpStatus(422)).toBe(false);
  });
});
