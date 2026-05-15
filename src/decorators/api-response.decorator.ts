import { SetMetadata, applyDecorators, UseInterceptors, UseFilters } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForgeResponseInterceptor } from '../interceptors/response.interceptor';
import { ForgeExceptionFilter } from '../filters/global-exception.filter';
import { ForgeOptions } from '../interfaces/api-response.interface';

export const FORGE_MESSAGE_KEY = 'forge:response_message';
export const FORGE_RAW_RESPONSE_KEY = 'forge:raw_response';
export const FORGE_META_KEY = 'forge:extra_meta';
export const FORGE_DEPRECATED_KEY = 'forge:deprecated';

/** Override the default success message for a route or controller */
export const ForgeMessage = (message: string) =>
  SetMetadata(FORGE_MESSAGE_KEY, message);

/** Skip response wrapping; return raw handler output */
export const ForgeRawResponse = () => SetMetadata(FORGE_RAW_RESPONSE_KEY, true);

/**
 * Merge extra key-value pairs into `meta` for a specific route or controller.
 *
 * @example
 * @ForgeMeta({ region: 'us-east-1', service: 'orders' })
 */
export const ForgeMeta = (extra: Record<string, unknown>) =>
  SetMetadata(FORGE_META_KEY, extra);

/**
 * Mark a route or controller as deprecated.
 * Adds `meta.deprecated: true` (and optionally `meta.deprecationNotice`) to
 * every response and sets the `Deprecation: true` response header.
 *
 * @example
 * @ForgeDeprecated('Use /v2/users instead')
 */
export const ForgeDeprecated = (notice?: string) =>
  SetMetadata(FORGE_DEPRECATED_KEY, notice ?? true);

/**
 * Applies ForgeResponseInterceptor + ForgeExceptionFilter to a single
 * controller or route handler. For global registration use ApiForgeModule.
 */
export function ApiForge(options: ForgeOptions = {}) {
  const reflector = new Reflector();
  return applyDecorators(
    UseInterceptors(new ForgeResponseInterceptor(reflector, options)),
    UseFilters(new ForgeExceptionFilter(options)),
  );
}
