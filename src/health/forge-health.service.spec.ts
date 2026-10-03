import { ForgeHealthService } from './forge-health.service';
import { ForgeHealthOptions } from './forge-health.interfaces';

const service = (options: ForgeHealthOptions = {}) => new ForgeHealthService(options);

describe('ForgeHealthService', () => {
  it('reports ok with uptime by default', async () => {
    const { data, ok } = await service().check();

    expect(ok).toBe(true);
    expect(data.status).toBe('ok');
    expect(typeof data.uptime).toBe('number');
    expect(data.memory).toBeUndefined();
    expect(data.checks).toBeUndefined();
  });

  it('omits uptime when disabled and includes version and memory when asked', async () => {
    const { data } = await service({
      includeUptime: false,
      includeMemory: true,
      version: '1.2.3',
    }).check();

    expect(data.uptime).toBeUndefined();
    expect(data.version).toBe('1.2.3');
    expect(Object.keys(data.memory ?? {})).toEqual(['rss', 'heapUsed', 'heapTotal', 'external']);
  });

  it('runs sync and async checks and stays ok when all pass', async () => {
    const { data, ok } = await service({
      checks: [
        { name: 'db', check: async () => ({ status: 'ok' }) },
        { name: 'cache', check: () => ({ status: 'ok' }) },
      ],
    }).check();

    expect(ok).toBe(true);
    expect(data.status).toBe('ok');
    expect(data.checks).toEqual({ db: { status: 'ok' }, cache: { status: 'ok' } });
  });

  it('is degraded when a check returns an error status', async () => {
    const { data, ok } = await service({
      checks: [{ name: 'db', check: () => ({ status: 'error', message: 'down' }) }],
    }).check();

    expect(ok).toBe(false);
    expect(data.status).toBe('degraded');
    expect(data.checks?.db).toEqual({ status: 'error', message: 'down' });
  });

  it('turns a throwing check into an error result', async () => {
    const { data, ok } = await service({
      checks: [
        {
          name: 'db',
          check: () => {
            throw new Error('boom');
          },
        },
        {
          name: 'other',
          check: () => {
            throw 'not an Error';
          },
        },
      ],
    }).check();

    expect(ok).toBe(false);
    expect(data.checks?.db).toEqual({ status: 'error', message: 'boom' });
    expect(data.checks?.other).toEqual({ status: 'error', message: 'Check failed' });
  });
});
