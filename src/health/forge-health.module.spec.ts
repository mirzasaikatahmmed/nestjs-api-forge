import { Test } from '@nestjs/testing';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ServiceUnavailableException } from '../exceptions';
import { ForgeHealthController } from './forge-health.controller';
import { ForgeHealthModule } from './forge-health.module';

async function controllerFor(options: Parameters<typeof ForgeHealthModule.register>[0]) {
  const dynamic = ForgeHealthModule.register(options);
  const moduleRef = await Test.createTestingModule({ imports: [dynamic] }).compile();
  const controllerClass = dynamic.controllers?.[0] as typeof ForgeHealthController;
  return {
    controller: moduleRef.get(controllerClass),
    path: Reflect.getMetadata(PATH_METADATA, controllerClass),
  };
}

describe('ForgeHealthModule', () => {
  it('mounts at /health by default and returns a formatted response', async () => {
    const { controller, path } = await controllerFor({});
    const res = await controller.health();

    expect(path).toBe('health');
    expect(res).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Service is healthy',
      data: { status: 'ok' },
    });
  });

  it('uses a custom path', async () => {
    const { path } = await controllerFor({ path: 'status' });

    expect(path).toBe('status');
  });

  it('throws ServiceUnavailableException when a check fails', async () => {
    const { controller } = await controllerFor({
      checks: [{ name: 'db', check: () => ({ status: 'error' }) }],
    });

    await expect(controller.health()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
