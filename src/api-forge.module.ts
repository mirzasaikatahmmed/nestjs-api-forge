import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ForgeExceptionFilter } from './filters/global-exception.filter';
import { ForgeResponseInterceptor } from './interceptors/response.interceptor';
import { ForgeOptions } from './interfaces/api-response.interface';

export const FORGE_OPTIONS = 'FORGE_OPTIONS';

@Global()
@Module({})
export class ApiForgeModule {
  static forRoot(options: ForgeOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: FORGE_OPTIONS,
      useValue: options,
    };

    const exceptionFilterProvider: Provider = {
      provide: APP_FILTER,
      useFactory: () => new ForgeExceptionFilter(options),
    };

    const responseInterceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) =>
        new ForgeResponseInterceptor(reflector, options),
      inject: [Reflector],
    };

    return {
      module: ApiForgeModule,
      providers: [
        optionsProvider,
        exceptionFilterProvider,
        responseInterceptorProvider,
      ],
      exports: [FORGE_OPTIONS],
    };
  }

  static forRootAsync(asyncOptions: {
    useFactory: (...args: any[]) => ForgeOptions | Promise<ForgeOptions>;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    const optionsProvider: Provider = {
      provide: FORGE_OPTIONS,
      useFactory: asyncOptions.useFactory,
      inject: asyncOptions.inject ?? [],
    };

    const exceptionFilterProvider: Provider = {
      provide: APP_FILTER,
      useFactory: (options: ForgeOptions) => new ForgeExceptionFilter(options),
      inject: [FORGE_OPTIONS],
    };

    const responseInterceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector, options: ForgeOptions) =>
        new ForgeResponseInterceptor(reflector, options),
      inject: [Reflector, FORGE_OPTIONS],
    };

    return {
      module: ApiForgeModule,
      imports: asyncOptions.imports ?? [],
      providers: [
        optionsProvider,
        exceptionFilterProvider,
        responseInterceptorProvider,
      ],
      exports: [FORGE_OPTIONS],
    };
  }
}
