import { ValidationPipe, ValidationPipeOptions, ValidationError } from '@nestjs/common';
import { ValidationException } from '../exceptions/validation.exception';
import { ApiErrorDetail } from '../interfaces/api-response.interface';

/**
 * Drop-in replacement for NestJS `ValidationPipe` that throws a structured
 * `ValidationException` (with typed field-level details) instead of a plain
 * `BadRequestException` with an array of strings.
 *
 * Defaults: whitelist, transform, forbidNonWhitelisted — override as needed.
 *
 * @example
 * // main.ts
 * app.useGlobalPipes(new ForgeValidationPipe());
 */
export class ForgeValidationPipe extends ValidationPipe {
  constructor(options: ValidationPipeOptions = {}) {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      ...options,
      exceptionFactory: (errors: ValidationError[]) =>
        new ValidationException(flattenErrors(errors)),
    });
  }
}

function flattenErrors(
  errors: ValidationError[],
  parentField?: string,
): ApiErrorDetail[] {
  const details: ApiErrorDetail[] = [];

  for (const err of errors) {
    const field = parentField ? `${parentField}.${err.property}` : err.property;

    if (err.constraints) {
      details.push({
        field,
        message: Object.values(err.constraints).join(', '),
      });
    }

    if (err.children?.length) {
      details.push(...flattenErrors(err.children, field));
    }
  }

  return details;
}
