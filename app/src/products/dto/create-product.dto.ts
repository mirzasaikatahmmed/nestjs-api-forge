import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop' })
  name: string;

  @ApiProperty({ example: 999.99, minimum: 0.01 })
  price: number;

  @ApiProperty({ example: 15, minimum: 0 })
  stock: number;
}
