import { httpStatusToErrorCode, isClientError, isServerError } from './error-code.util';

describe('error-code.util', () => {
  it.each([
    [400, 'BAD_REQUEST'],
    [404, 'NOT_FOUND'],
    [423, 'LOCKED'],
    [429, 'TOO_MANY_REQUESTS'],
    [500, 'INTERNAL_SERVER_ERROR'],
    [504, 'GATEWAY_TIMEOUT'],
  ])('maps %i to %s', (status, code) => {
    expect(httpStatusToErrorCode(status)).toBe(code);
  });

  it('falls back to UNKNOWN_ERROR for unmapped statuses', () => {
    expect(httpStatusToErrorCode(418)).toBe('UNKNOWN_ERROR');
  });

  it('classifies client and server errors', () => {
    expect(isClientError(399)).toBe(false);
    expect(isClientError(400)).toBe(true);
    expect(isClientError(499)).toBe(true);
    expect(isClientError(500)).toBe(false);
    expect(isServerError(499)).toBe(false);
    expect(isServerError(500)).toBe(true);
  });
});
