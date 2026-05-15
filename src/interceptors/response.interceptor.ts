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
import { Request } from 'express';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ForgeOptions } from '../interfaces/api-response.interface';
import {
  FORGE_MESSAGE_KEY,
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

    const customMessage = this.reflector.getAllAndOverride<string>(
      FORGE_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<Request>();
    const statusCode = context.switchToHttp().getResponse().statusCode;

    const meta = this.buildMeta(request);

    return next.handle().pipe(
      map((data) => {
        const message =
          customMessage ??
          this.options.defaultSuccessMessage ??
          'Request successful';

        return ApiResponseDto.success(data, message, statusCode, meta);
      }),
    );
  }

  private buildMeta(request: Request) {
    const {
      includePath = true,
      includeTimestamp = true,
      includeRequestId = false,
      version,
    } = this.options;
    return {
      ...(includeTimestamp && { timestamp: new Date().toISOString() }),
      ...(includePath && { path: request.url }),
      ...(version && { version }),
      ...(includeRequestId && { requestId: randomUUID() }),
    };
  }
}
