import { HttpStatus } from '@nestjs/common';
import { ApiException } from './api.exception';
import { ApiErrorDetail } from '../interfaces/api-response.interface';

export class ValidationException extends ApiException {
  constructor(details: ApiErrorDetail[]) {
    super('Validation failed', HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }

  static fromConstraints(
    constraints: Record<string, Record<string, string>>,
  ): ValidationException {
    const details: ApiErrorDetail[] = Object.entries(constraints).map(
      ([field, messages]) => ({
        field,
        message: Object.values(messages).join(', '),
      }),
    );
    return new ValidationException(details);
  }
}
