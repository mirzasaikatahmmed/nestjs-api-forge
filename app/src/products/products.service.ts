import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  BadRequestException,
} from 'nestjs-api-forge';
import { CreateProductDto } from './dto/create-product.dto';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

@Injectable()
export class ProductsService {
  private products: Product[] = [
    { id: 1, name: 'Laptop', price: 999.99, stock: 15 },
    { id: 2, name: 'Keyboard', price: 49.99, stock: 200 },
    { id: 3, name: 'Monitor', price: 349.99, stock: 30 },
  ];
  private nextId = 4;

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: number): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) throw new NotFoundException('Product');
    return product;
  }

  create(dto: CreateProductDto): Product {
    if (dto.price <= 0) {
      throw new BadRequestException('Price must be greater than zero', [
        { field: 'price', message: 'Must be a positive number', value: dto.price },
      ]);
    }
    const product: Product = { id: this.nextId++, ...dto };
    this.products.push(product);
    return product;
  }

  remove(id: number): void {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new NotFoundException('Product');
    this.products.splice(index, 1);
  }
}
