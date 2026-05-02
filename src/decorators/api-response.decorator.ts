import { SetMetadata, applyDecorators, UseInterceptors, UseFilters } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ForgeResponseInterceptor } from '../interceptors/response.interceptor';
import { ForgeExceptionFilter } from '../filters/global-exception.filter';
import { ForgeOptions } from '../interfaces/api-response.interface';

export const FORGE_MESSAGE_KEY = 'forge:response_message';
export const FORGE_RAW_RESPONSE_KEY = 'forge:raw_response';

/** Override the default success message for a route or controller */
export const ForgeMessage = (message: string) =>
  SetMetadata(FORGE_MESSAGE_KEY, message);

/** Skip response wrapping; return raw handler output */
export const ForgeRawResponse = () => SetMetadata(FORGE_RAW_RESPONSE_KEY, true);

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
