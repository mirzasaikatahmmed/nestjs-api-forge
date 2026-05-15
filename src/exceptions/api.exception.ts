import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiErrorDetail } from '../interfaces/api-response.interface';

export class ApiException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus,
    public readonly code: string,
    public readonly details?: ApiErrorDetail[],
  ) {
    super({ message, code, details }, statusCode);
  }
}

export class BadRequestException extends ApiException {
  constructor(message = 'Bad request', details?: ApiErrorDetail[]) {
    super(message, HttpStatus.BAD_REQUEST, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends ApiException {
  constructor(message = 'Forbidden resource') {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN');
  }
}

export class NotFoundException extends ApiException {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HttpStatus.NOT_FOUND, 'NOT_FOUND');
  }
}

export class ConflictException extends ApiException {
  constructor(message = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT, 'CONFLICT');
  }
}

export class UnprocessableEntityException extends ApiException {
  constructor(message = 'Unprocessable entity', details?: ApiErrorDetail[]) {
    super(
      message,
      HttpStatus.UNPROCESSABLE_ENTITY,
      'UNPROCESSABLE_ENTITY',
      details,
    );
  }
}

export class TooManyRequestsException extends ApiException {
  constructor(message = 'Too many requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS');
  }
}

export class InternalServerException extends ApiException {
  constructor(message = 'Internal server error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR');
  }
}

export class ServiceUnavailableException extends ApiException {
  constructor(message = 'Service unavailable') {
    super(message, HttpStatus.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE');
  }
}

export class MethodNotAllowedException extends ApiException {
  constructor(message = 'Method not allowed') {
    super(message, HttpStatus.METHOD_NOT_ALLOWED, 'METHOD_NOT_ALLOWED');
  }
}

export class PaymentRequiredException extends ApiException {
  constructor(message = 'Payment required') {
    super(message, HttpStatus.PAYMENT_REQUIRED, 'PAYMENT_REQUIRED');
  }
}

export class GatewayTimeoutException extends ApiException {
  constructor(message = 'Gateway timeout') {
    super(message, HttpStatus.GATEWAY_TIMEOUT, 'GATEWAY_TIMEOUT');
  }
}
