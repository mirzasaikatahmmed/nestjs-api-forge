import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { ForgeResponseInterceptor } from './response.interceptor';
import { ForgeOptions } from '../interfaces/api-response.interface';
import {
  FORGE_DEPRECATED_KEY,
  FORGE_MESSAGE_KEY,
  FORGE_META_KEY,
  FORGE_RAW_RESPONSE_KEY,
} from '../decorators/api-response.decorator';

type Metadata = Partial<Record<string, unknown>>;

function setup(options: ForgeOptions = {}, metadata: Metadata = {}, headers: Record<string, string> = {}) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockImplementation((key) => metadata[key as string] as never);

  const response = { statusCode: 200, setHeader: jest.fn() };
  const request = { url: '/orders', headers };
  const context = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => response }),
  } as unknown as ExecutionContext;
  const next: CallHandler = { handle: () => of({ id: 1 }) };

  const run = () => lastValueFrom(new ForgeResponseInterceptor(reflector, options).intercept(context, next));
  return { run, response };
}

describe('ForgeResponseInterceptor', () => {
  it('wraps handler output in the standard envelope', async () => {
    const { run } = setup();

    await expect(run()).resolves.toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Request successful',
      data: { id: 1 },
      meta: { path: '/orders' },
    });
  });

  it('uses the response status code', async () => {
    const { run, response } = setup();
    response.statusCode = 201;

    await expect(run()).resolves.toMatchObject({ statusCode: 201 });
  });

  it('returns the raw handler output for @ForgeRawResponse routes', async () => {
    const { run } = setup({}, { [FORGE_RAW_RESPONSE_KEY]: true });

    await expect(run()).resolves.toEqual({ id: 1 });
  });

  it('prefers the route message over the default message option', async () => {
    const withOption = setup({ defaultSuccessMessage: 'Fine' });
    await expect(withOption.run()).resolves.toMatchObject({ message: 'Fine' });

    const withBoth = setup({ defaultSuccessMessage: 'Fine' }, { [FORGE_MESSAGE_KEY]: 'Custom' });
    await expect(withBoth.run()).resolves.toMatchObject({ message: 'Custom' });
  });

  it('merges extra meta, version, and response time', async () => {
    const { run } = setup(
      { version: 'v1', includeResponseTime: true },
      { [FORGE_META_KEY]: { region: 'eu' } },
    );
    const res = (await run()) as { meta: Record<string, unknown> };

    expect(res.meta).toMatchObject({ version: 'v1', region: 'eu', path: '/orders' });
    expect(res.meta.responseTime).toMatch(/^\d+ms$/);
  });

  // Known bug: ApiResponseDto.success always adds `timestamp`, so the option is ignored.
  // Remove `.failing` once fixed.
  it.failing('omits the timestamp when includeTimestamp is false', async () => {
    const { run } = setup({ includeTimestamp: false });
    const res = (await run()) as { meta: Record<string, unknown> };

    expect(res.meta.timestamp).toBeUndefined();
  });

  it('marks deprecated routes in meta and the Deprecation header', async () => {
    const plain = setup({}, { [FORGE_DEPRECATED_KEY]: true });
    const plainRes = (await plain.run()) as { meta: Record<string, unknown> };
    expect(plainRes.meta).toMatchObject({ deprecated: true });
    expect(plainRes.meta.deprecationNotice).toBeUndefined();
    expect(plain.response.setHeader).toHaveBeenCalledWith('Deprecation', 'true');

    const withNotice = setup({}, { [FORGE_DEPRECATED_KEY]: 'Use /v2/orders' });
    await expect(withNotice.run()).resolves.toMatchObject({
      meta: { deprecated: true, deprecationNotice: 'Use /v2/orders' },
    });
  });

  it('sets a request id header and meta when enabled', async () => {
    const generated = setup({ includeRequestId: true });
    const res = (await generated.run()) as { meta: { requestId: string } };
    expect(res.meta.requestId).toMatch(/^[0-9a-f-]{36}$/);
    expect(generated.response.setHeader).toHaveBeenCalledWith('x-request-id', res.meta.requestId);

    const passthrough = setup({ includeRequestId: true }, {}, { 'x-request-id': 'req-9' });
    await expect(passthrough.run()).resolves.toMatchObject({ meta: { requestId: 'req-9' } });
  });
});
