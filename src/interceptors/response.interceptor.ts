import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ForgeOptions } from '../interfaces/api-response.interface';
import {
  FORGE_DEPRECATED_KEY,
  FORGE_MESSAGE_KEY,
  FORGE_META_KEY,
  FORGE_RAW_RESPONSE_KEY,
} from '../decorators/api-response.decorator';

@Injectable()
export class ForgeResponseInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly options: ForgeOptions = {},
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(
      FORGE_RAW_RESPONSE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isRaw) return next.handle();

    const start = Date.now();

    const customMessage = this.reflector.getAllAndOverride<string>(
      FORGE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const extraMeta = this.reflector.getAllAndOverride<Record<string, unknown>>(
      FORGE_META_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? {};

    const deprecatedValue = this.reflector.getAllAndOverride<true | string>(
      FORGE_DEPRECATED_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode;

    const requestId = this.resolveRequestId(request);
    if (requestId) response.setHeader('x-request-id', requestId);
    if (deprecatedValue) response.setHeader('Deprecation', 'true');

    return next.handle().pipe(
      map((data) => {
        const message =
          customMessage ??
          this.options.defaultSuccessMessage ??
          'Request successful';

        const deprecationMeta = deprecatedValue
          ? {
              deprecated: true as const,
              ...(typeof deprecatedValue === 'string' && {
                deprecationNotice: deprecatedValue,
              }),
            }
          : {};

        const meta = {
          ...this.buildMeta(request, requestId),
          ...(this.options.includeResponseTime && {
            responseTime: `${Date.now() - start}ms`,
          }),
          ...deprecationMeta,
          ...extraMeta,
        };

        return ApiResponseDto.success(data, message, statusCode, meta);
      }),
    );
  }

  private resolveRequestId(request: Request): string | undefined {
    const { includeRequestId = false, correlationIdHeader } = this.options;
    if (!includeRequestId && !correlationIdHeader) return undefined;

    const headers =
      typeof correlationIdHeader === 'string'
        ? [correlationIdHeader]
        : Array.isArray(correlationIdHeader)
          ? correlationIdHeader
          : ['x-request-id', 'x-correlation-id'];

    for (const h of headers) {
      const val = request.headers[h.toLowerCase()];
      if (typeof val === 'string' && val) return val;
    }

    return includeRequestId ? randomUUID() : undefined;
  }

  private buildMeta(request: Request, requestId: string | undefined) {
    const { includePath = true, includeTimestamp = true, version } = this.options;
    return {
      ...(includeTimestamp && { timestamp: new Date().toISOString() }),
      ...(includePath && { path: request.url }),
      ...(version && { version }),
      ...(requestId && { requestId }),
    };
  }
}
