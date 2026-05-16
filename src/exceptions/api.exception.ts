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

export class NotAcceptableException extends ApiException {
  constructor(message = 'Not acceptable') {
    super(message, HttpStatus.NOT_ACCEPTABLE, 'NOT_ACCEPTABLE');
  }
}

export class RequestTimeoutException extends ApiException {
  constructor(message = 'Request timeout') {
    super(message, HttpStatus.REQUEST_TIMEOUT, 'REQUEST_TIMEOUT');
  }
}

export class GoneException extends ApiException {
  constructor(message = 'Resource no longer available') {
    super(message, HttpStatus.GONE, 'GONE');
  }
}

export class PayloadTooLargeException extends ApiException {
  constructor(message = 'Payload too large') {
    super(message, HttpStatus.PAYLOAD_TOO_LARGE, 'PAYLOAD_TOO_LARGE');
  }
}

export class UnsupportedMediaTypeException extends ApiException {
  constructor(message = 'Unsupported media type') {
    super(message, HttpStatus.UNSUPPORTED_MEDIA_TYPE, 'UNSUPPORTED_MEDIA_TYPE');
  }
}

export class LockedException extends ApiException {
  constructor(message = 'Resource is locked') {
    super(message, HttpStatus.LOCKED, 'LOCKED');
  }
}

export class FailedDependencyException extends ApiException {
  constructor(message = 'Failed dependency') {
    super(message, HttpStatus.FAILED_DEPENDENCY, 'FAILED_DEPENDENCY');
  }
}

export class PreconditionRequiredException extends ApiException {
  constructor(message = 'Precondition required') {
    super(message, HttpStatus.PRECONDITION_REQUIRED, 'PRECONDITION_REQUIRED');
  }
}

export class NotImplementedException extends ApiException {
  constructor(message = 'Not implemented') {
    super(message, HttpStatus.NOT_IMPLEMENTED, 'NOT_IMPLEMENTED');
  }
}

export class BadGatewayException extends ApiException {
  constructor(message = 'Bad gateway') {
    super(message, HttpStatus.BAD_GATEWAY, 'BAD_GATEWAY');
  }
}
