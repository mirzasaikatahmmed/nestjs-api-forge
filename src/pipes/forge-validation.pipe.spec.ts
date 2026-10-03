import { ArgumentMetadata } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsString, Min, ValidateNested } from 'class-validator';
import { ValidationException } from '../exceptions/validation.exception';
import { ForgeValidationPipe } from './forge-validation.pipe';

class AddressDto {
  @IsString()
  city!: string;
}

class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsInt()
  @Min(18)
  age!: number;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}

const metadata: ArgumentMetadata = { type: 'body', metatype: CreateUserDto };

const valid = { email: 'a@b.co', age: 30, address: { city: 'Dhaka' } };

async function validationError(
  pipe: ForgeValidationPipe,
  value: unknown,
): Promise<ValidationException> {
  try {
    await pipe.transform(value, metadata);
  } catch (err) {
    return err as ValidationException;
  }
  throw new Error('Expected the pipe to throw');
}

describe('ForgeValidationPipe', () => {
  it('returns a transformed class instance for valid input', async () => {
    const result = await new ForgeValidationPipe().transform(valid, metadata);

    expect(result).toBeInstanceOf(CreateUserDto);
    expect(result.address).toBeInstanceOf(AddressDto);
    expect(result).toMatchObject(valid);
  });

  it('throws a ValidationException with field-level details', async () => {
    const err = await validationError(new ForgeValidationPipe(), {
      ...valid,
      email: 'nope',
      age: 5,
    });

    expect(err).toBeInstanceOf(ValidationException);
    expect(err.getStatus()).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual([
      { field: 'email', message: 'email must be an email' },
      { field: 'age', message: 'age must not be less than 18' },
    ]);
  });

  it('flattens nested errors to dotted field paths', async () => {
    const err = await validationError(new ForgeValidationPipe(), {
      ...valid,
      address: { city: 123 },
    });

    expect(err.details).toEqual([
      { field: 'address.city', message: 'city must be a string' },
    ]);
  });

  it('rejects unknown properties by default', async () => {
    const err = await validationError(new ForgeValidationPipe(), {
      ...valid,
      admin: true,
    });

    expect(err.details).toEqual([
      {
        field: 'admin',
        message: 'property admin should not exist',
      },
    ]);
  });

  it('lets callers override the defaults', async () => {
    const result = await new ForgeValidationPipe({
      forbidNonWhitelisted: false,
    }).transform({ ...valid, admin: true }, metadata);

    expect(result).not.toHaveProperty('admin');
  });

  it('keeps its exceptionFactory even if the caller passes one', async () => {
    const err = await validationError(
      new ForgeValidationPipe({ exceptionFactory: () => new Error('custom') }),
      { ...valid, email: 'nope' },
    );

    expect(err).toBeInstanceOf(ValidationException);
  });
});
