import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
import { ApiResponseDto } from '../dto/api-response.dto';
import { ForgeOptions } from '../interfaces/api-response.interface';
import { httpStatusToErrorCode } from '../utils/error-code.util';

@Catch()
export class ForgeExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ForgeExceptionFilter.name);

  constructor(private readonly options: ForgeOptions = {}) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const meta = this.buildMeta(request);
    const errorResponse = this.buildErrorResponse(exception, meta);

    if (errorResponse.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${errorResponse.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `${request.method} ${request.url} → ${errorResponse.statusCode}: ${errorResponse.message}`,
      );
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildMeta(request: Request) {
    const { includePath = true, includeTimestamp = true, version } = this.options;
    return {
      ...(includeTimestamp && { timestamp: new Date().toISOString() }),
      ...(includePath && { path: request.url }),
      ...(version && { version }),
    };
  }

  private buildErrorResponse(exception: unknown, meta: Record<string, string>) {
    if (exception instanceof ApiException) {
      return ApiResponseDto.error(
        exception.message,
        exception.getStatus(),
        { code: exception.code, details: exception.details },
        meta,
      );
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const message = this.extractHttpExceptionMessage(exceptionResponse);
      const details = this.extractValidationDetails(exceptionResponse);

      return ApiResponseDto.error(
        message,
        status,
        {
          code: httpStatusToErrorCode(status),
          ...(details.length > 0 && { details }),
        },
        meta,
      );
    }

    return ApiResponseDto.error(
      'An unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
      { code: 'INTERNAL_SERVER_ERROR' },
      meta,
    );
  }

  private extractHttpExceptionMessage(response: string | object): string {
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null) {
      const r = response as Record<string, unknown>;
      if (typeof r['message'] === 'string') return r['message'];
      if (Array.isArray(r['message'])) return 'Validation failed';
      if (typeof r['error'] === 'string') return r['error'];
    }
    return 'An error occurred';
  }

  private extractValidationDetails(
    response: string | object,
  ): Array<{ field?: string; message: string }> {
    if (typeof response !== 'object' || response === null) return [];
    const r = response as Record<string, unknown>;

    if (!Array.isArray(r['message'])) return [];

    return (r['message'] as string[]).map((msg) => {
      const parts = msg.split(' ');
      const field = parts.shift();
      return { field, message: parts.join(' ') };
    });
  }
}
