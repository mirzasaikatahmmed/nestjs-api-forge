import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Alice Johnson' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'alice@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 28, minimum: 1, maximum: 120 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;
}
