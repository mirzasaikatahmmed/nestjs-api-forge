import {
  Controller,
  Get,
  INestApplication,
  Injectable,
  Module,
  Post,
  Body,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsString } from 'class-validator';
import { ApiForgeModule, FORGE_OPTIONS } from './api-forge.module';
import { ForgeMessage } from './decorators';
import { NotFoundException } from './exceptions';
import { ForgeValidationPipe } from './pipes';
import { ForgeOptions } from './interfaces/api-response.interface';

class NameDto {
  @IsString()
  name!: string;
}

@Controller('items')
class ItemsController {
  @Get()
  @ForgeMessage('Items fetched')
  list() {
    return [{ id: 1 }];
  }

  @Get('missing')
  missing() {
    throw new NotFoundException('Item');
  }

  @Get('boom')
  boom() {
    throw new Error('secret internals');
  }

  @Post()
  create(@Body() body: NameDto) {
    return body;
  }
}

@Injectable()
class ConfigService {
  readonly version = 'v7';
}

@Module({ providers: [ConfigService], exports: [ConfigService] })
class ConfigModule {}

async function startApp(imports: unknown[]): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: imports as never[],
    controllers: [ItemsController],
  }).compile();
  const app = moduleRef.createNestApplication({ logger: false });
  app.useGlobalPipes(new ForgeValidationPipe());
  await app.listen(0);
  return app;
}

type JsonBody = Record<string, any>;

async function call(app: INestApplication, path: string, init?: RequestInit) {
  const res = await fetch(`${await app.getUrl()}${path}`, init);
  return { res, body: (await res.json()) as JsonBody };
}

describe('ApiForgeModule', () => {
  let app: INestApplication;

  afterEach(async () => {
    await app.close();
  });

  describe('forRoot', () => {
    beforeEach(async () => {
      app = await startApp([
        ApiForgeModule.forRoot({ version: 'v1', includeRequestId: true }),
      ]);
    });

    it('wraps successful responses in the envelope', async () => {
      const { res, body } = await call(app, '/items');

      expect(res.status).toBe(200);
      expect(body).toMatchObject({
        success: true,
        statusCode: 200,
        message: 'Items fetched',
        data: [{ id: 1 }],
        meta: { path: '/items', version: 'v1' },
      });
      expect(res.headers.get('x-request-id')).toBe(body.meta.requestId);
    });

    it('formats ApiException errors', async () => {
      const { res, body } = await call(app, '/items/missing');

      expect(res.status).toBe(404);
      expect(body).toMatchObject({
        success: false,
        statusCode: 404,
        message: 'Item not found',
        error: { code: 'NOT_FOUND' },
      });
    });

    it('hides the message of unexpected errors', async () => {
      const { res, body } = await call(app, '/items/boom');

      expect(res.status).toBe(500);
      expect(body.message).toBe('An unexpected error occurred');
      expect(JSON.stringify(body)).not.toContain('secret internals');
    });

    it('returns field details for validation failures end to end', async () => {
      const { res, body } = await call(app, '/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 42 }),
      });

      expect(res.status).toBe(400);
      expect(body.error).toEqual({
        code: 'VALIDATION_ERROR',
        details: [{ field: 'name', message: 'name must be a string' }],
      });
    });

    it('uses the same response shape for unknown routes', async () => {
      const { res, body } = await call(app, '/nope');

      expect(res.status).toBe(404);
      expect(body).toMatchObject({
        success: false,
        error: { code: 'NOT_FOUND' },
      });
    });
  });

  describe('forRootAsync', () => {
    it('builds options from an injected provider', async () => {
      app = await startApp([
        ApiForgeModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService): ForgeOptions => ({
            version: config.version,
          }),
        }),
      ]);

      const { body } = await call(app, '/items');

      expect(body.meta.version).toBe('v7');
    });

    it('exports the resolved options', async () => {
      app = await startApp([
        ApiForgeModule.forRootAsync({
          useFactory: async () => ({ defaultSuccessMessage: 'Fine' }),
        }),
      ]);

      expect(app.get(FORGE_OPTIONS)).toEqual({ defaultSuccessMessage: 'Fine' });
    });
  });
});
