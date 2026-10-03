import { HttpException } from '@nestjs/common';
import * as exceptions from './api.exception';
import { ApiException } from './api.exception';
import { ValidationException } from './validation.exception';

const subclasses = Object.entries(exceptions).filter(
  ([name]) => name !== 'ApiException',
) as Array<[string, new () => ApiException]>;

describe('ApiException subclasses', () => {
  it.each(subclasses)('%s is an ApiException with a matching code', (_name, Ctor) => {
    const ex = new Ctor();

    expect(ex).toBeInstanceOf(ApiException);
    expect(ex).toBeInstanceOf(HttpException);
    expect(ex.getStatus()).toBeGreaterThanOrEqual(400);
    expect(ex.code).toMatch(/^[A-Z_]+$/);
    expect(ex.message).toBeTruthy();
  });

  it('NotFoundException builds the message from the resource name', () => {
    const ex = new exceptions.NotFoundException('User');

    expect(ex.message).toBe('User not found');
    expect(ex.getStatus()).toBe(404);
    expect(ex.code).toBe('NOT_FOUND');
  });

  it('LockedException uses status 423 on every supported Nest version', () => {
    const ex = new exceptions.LockedException();

    expect(ex.getStatus()).toBe(423);
    expect(ex.code).toBe('LOCKED');
  });

  it('keeps details on exceptions that accept them', () => {
    const details = [{ field: 'email', message: 'invalid' }];
    const ex = new exceptions.BadRequestException('Bad input', details);

    expect(ex.details).toEqual(details);
  });
});

describe('ValidationException', () => {
  it('uses 400 and the VALIDATION_ERROR code', () => {
    const ex = new ValidationException([{ field: 'name', message: 'required' }]);

    expect(ex.getStatus()).toBe(400);
    expect(ex.code).toBe('VALIDATION_ERROR');
    expect(ex.message).toBe('Validation failed');
  });

  it('builds details from class-validator constraints', () => {
    const ex = ValidationException.fromConstraints({
      email: { isEmail: 'email must be an email', isNotEmpty: 'email should not be empty' },
      age: { min: 'age must not be less than 18' },
    });

    expect(ex.details).toEqual([
      { field: 'email', message: 'email must be an email, email should not be empty' },
      { field: 'age', message: 'age must not be less than 18' },
    ]);
  });
});
