import { Injectable } from '@nestjs/common';
import {
  NotFoundException,
  ConflictException,
  ValidationException,
} from 'nestjs-api-forge';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34, createdAt: '2024-01-15T00:00:00.000Z' },
    { id: 3, name: 'Carol White', email: 'carol@example.com', age: 22, createdAt: '2024-02-01T00:00:00.000Z' },
  ];
  private nextId = 4;

  findAll(page = 1, limit = 10) {
    const start = (page - 1) * limit;
    const data = this.users.slice(start, start + limit);
    return { data, total: this.users.length };
  }

  findOne(id: number): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new NotFoundException('User');
    return user;
  }

  create(dto: CreateUserDto): User {
    // Validate required fields
    const errors: Record<string, Record<string, string>> = {};
    if (!dto.name) errors.name = { required: 'Name is required' };
    if (!dto.email) errors.email = { required: 'Email is required' };
    if (!dto.age) errors.age = { required: 'Age is required' };
    if (Object.keys(errors).length) throw ValidationException.fromConstraints(errors);

    // Check for duplicate email
    const exists = this.users.find((u) => u.email === dto.email);
    if (exists) throw new ConflictException(`Email "${dto.email}" is already registered`);

    const user: User = {
      id: this.nextId++,
      name: dto.name,
      email: dto.email,
      age: dto.age,
      createdAt: new Date().toISOString(),
    };
    this.users.push(user);
    return user;
  }

  update(id: number, dto: UpdateUserDto): User {
    const user = this.findOne(id);
    if (dto.email && dto.email !== user.email) {
      const exists = this.users.find((u) => u.email === dto.email);
      if (exists) throw new ConflictException(`Email "${dto.email}" is already taken`);
    }
    Object.assign(user, dto);
    return user;
  }

  remove(id: number): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) throw new NotFoundException('User');
    this.users.splice(index, 1);
  }
}
