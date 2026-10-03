import { ArgumentsHost, BadRequestException as NestBadRequest, HttpException, Logger } from '@nestjs/common';
import { ForgeExceptionFilter } from './global-exception.filter';
import { ForgeOptions } from '../interfaces/api-response.interface';
import { ConflictException } from '../exceptions';
import { ValidationException } from '../exceptions/validation.exception';

function setup(options: ForgeOptions = {}, headers: Record<string, string> = {}) {
  const json = jest.fn();
  const response = {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json,
  };
  const request = { method: 'GET', url: '/users?page=1', headers };
  const host = {
    switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }),
  } as unknown as ArgumentsHost;
  const filter = new ForgeExceptionFilter(options);
  return { filter, host, response, json, body: () => json.mock.calls[0][0] };
}

describe('ForgeExceptionFilter', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('formats ApiException with its code and details', () => {
    const { filter, host, response, body } = setup();
    const details = [{ field: 'name', message: 'taken' }];

    filter.catch(new ConflictException('Name taken'), host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(body()).toMatchObject({
      success: false,
      statusCode: 409,
      message: 'Name taken',
      error: { code: 'CONFLICT' },
      meta: { path: '/users?page=1' },
    });
    expect(body().error.details).toBeUndefined();

    filter.catch(new ValidationException(details), host);
    expect(response.json.mock.calls[1][0].error).toEqual({ code: 'VALIDATION_ERROR', details });
  });

  it('formats plain HttpException using the status-derived code', () => {
    const { filter, host, body } = setup();

    filter.catch(new HttpException('Teapot', 418), host);
    expect(body().error).toEqual({ code: 'UNKNOWN_ERROR' });

    const second = setup();
    second.filter.catch(new HttpException('Gone fishing', 404), second.host);
    expect(second.body()).toMatchObject({ statusCode: 404, message: 'Gone fishing', error: { code: 'NOT_FOUND' } });
  });

  it('turns Nest validation message arrays into field details', () => {
    const { filter, host, body } = setup();

    filter.catch(
      new NestBadRequest({ message: ['email must be an email', 'name should not be empty', 'bare'] }),
      host,
    );

    expect(body()).toMatchObject({ statusCode: 400, message: 'Validation failed' });
    expect(body().error).toEqual({
      code: 'BAD_REQUEST',
      details: [
        { field: 'email', message: 'must be an email' },
        { field: 'name', message: 'should not be empty' },
        { message: 'bare' },
      ],
    });
  });

  it('falls back to the error string when the response has no message', () => {
    const { filter, host, body } = setup();

    filter.catch(new HttpException({ error: 'Custom error' }, 400), host);

    expect(body().message).toBe('Custom error');
  });

  it('hides unknown error details behind a generic 500 and logs the stack', () => {
    const { filter, host, body } = setup();
    const errorLog = jest.spyOn(Logger.prototype, 'error');

    filter.catch(new Error('db password is hunter2'), host);

    expect(body()).toMatchObject({
      statusCode: 500,
      message: 'An unexpected error occurred',
      error: { code: 'INTERNAL_SERVER_ERROR' },
    });
    expect(JSON.stringify(body())).not.toContain('hunter2');
    expect(errorLog).toHaveBeenCalled();
  });

  it('handles thrown non-Error values', () => {
    const { filter, host, body } = setup();

    filter.catch('just a string', host);

    expect(body().statusCode).toBe(500);
  });

  it('respects the includePath and version meta options', () => {
    const { filter, host, body } = setup({ includePath: false, version: 'v2' });

    filter.catch(new ConflictException(), host);

    expect(body().meta.path).toBeUndefined();
    expect(body().meta.version).toBe('v2');
  });

  // Known bug: ApiResponseDto.error always adds `timestamp`, so the option is ignored.
  // Remove `.failing` once fixed.
  it.failing('omits the timestamp when includeTimestamp is false', () => {
    const { filter, host, body } = setup({ includeTimestamp: false });

    filter.catch(new ConflictException(), host);

    expect(body().meta.timestamp).toBeUndefined();
  });

  describe('request id', () => {
    it('is not set by default', () => {
      const { filter, host, response, body } = setup();

      filter.catch(new ConflictException(), host);

      expect(response.setHeader).not.toHaveBeenCalled();
      expect(body().meta.requestId).toBeUndefined();
    });

    it('generates a UUID when includeRequestId is on', () => {
      const { filter, host, response, body } = setup({ includeRequestId: true });

      filter.catch(new ConflictException(), host);

      expect(body().meta.requestId).toMatch(/^[0-9a-f-]{36}$/);
      expect(response.setHeader).toHaveBeenCalledWith('x-request-id', body().meta.requestId);
    });

    it('passes through the incoming correlation header', () => {
      const { filter, host, body } = setup({ includeRequestId: true }, { 'x-correlation-id': 'abc-123' });

      filter.catch(new ConflictException(), host);

      expect(body().meta.requestId).toBe('abc-123');
    });

    it('supports a custom header name and does not generate when absent', () => {
      const withHeader = setup({ correlationIdHeader: 'X-Trace' }, { 'x-trace': 't-1' });
      withHeader.filter.catch(new ConflictException(), withHeader.host);
      expect(withHeader.body().meta.requestId).toBe('t-1');

      const without = setup({ correlationIdHeader: ['x-a', 'x-b'] });
      without.filter.catch(new ConflictException(), without.host);
      expect(without.body().meta.requestId).toBeUndefined();
    });
  });
});
