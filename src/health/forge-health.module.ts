import { Controller, DynamicModule, Module } from '@nestjs/common';
import { ForgeHealthController } from './forge-health.controller';
import { ForgeHealthOptions } from './forge-health.interfaces';
import { FORGE_HEALTH_OPTIONS, ForgeHealthService } from './forge-health.service';

@Module({})
export class ForgeHealthModule {
  static register(options: ForgeHealthOptions = {}): DynamicModule {
    const path = options.path ?? 'health';

    @Controller(path)
    class DynamicHealthController extends ForgeHealthController {}

    return {
      module: ForgeHealthModule,
      providers: [
        { provide: FORGE_HEALTH_OPTIONS, useValue: options },
        ForgeHealthService,
      ],
      controllers: [DynamicHealthController],
    };
  }
}
