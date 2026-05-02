import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ForgeExceptionFilter } from './filters/global-exception.filter';
import { ForgeResponseInterceptor } from './interceptors/response.interceptor';
import { ForgeOptions } from './interfaces/api-response.interface';

export const FORGE_OPTIONS = 'FORGE_OPTIONS';

@Global()
@Module({})
export class ApiForgeModule {
  /**
   * Register globally — applies the exception filter and response interceptor
   * to every route in the application.
   */
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

  /**
   * Register with async options — useful when options depend on a config service.
   */
  static forRootAsync(asyncOptions: {
    useFactory: (...args: any[]) => ForgeOptions | Promise<ForgeOptions>;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    const exceptionFilterProvider: Provider = {
      provide: APP_FILTER,
      useFactory: async (...args: any[]) => {
        const options = await asyncOptions.useFactory(...args);
        return new ForgeExceptionFilter(options);
      },
      inject: asyncOptions.inject ?? [],
    };

    const responseInterceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useFactory: async (reflector: Reflector, ...args: any[]) => {
        const options = await asyncOptions.useFactory(...args);
        return new ForgeResponseInterceptor(reflector, options);
      },
      inject: [Reflector, ...(asyncOptions.inject ?? [])],
    };

    return {
      module: ApiForgeModule,
      imports: asyncOptions.imports ?? [],
      providers: [exceptionFilterProvider, responseInterceptorProvider],
    };
  }
}
