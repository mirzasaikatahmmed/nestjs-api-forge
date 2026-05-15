# nestjs-api-forge

[![Build & Publish](https://github.com/mirzasaikatahmmed/nestjs-api-forge/actions/workflows/publish.yml/badge.svg)](https://github.com/mirzasaikatahmmed/nestjs-api-forge/actions/workflows/publish.yml)
[![npm version](https://img.shields.io/npm/v/nestjs-api-forge.svg)](https://www.npmjs.com/package/nestjs-api-forge)
[![npm downloads](https://img.shields.io/npm/dm/nestjs-api-forge.svg)](https://www.npmjs.com/package/nestjs-api-forge)
[![license](https://img.shields.io/npm/l/nestjs-api-forge.svg)](https://github.com/mirzasaikatahmmed/nestjs-api-forge/blob/main/LICENSE)

Plug-and-play response envelope, exception filter, and error formatting for [NestJS](https://nestjs.com/) REST APIs — zero boilerplate, fully typed.

---

## Features

- **Uniform success envelope** — every handler response wrapped with `success`, `statusCode`, `message`, `data`, and `meta`
- **Structured error responses** — consistent `code`, `message`, and optional `details` array for all errors
- **Global exception filter** — handles `HttpException`, `ValidationPipe` errors, and unexpected exceptions
- **Paginated response helper** — `ApiResponseDto.paginated()` with full pagination meta
- **Built-in typed exceptions** — drop-in replacements for NestJS built-ins with structured error codes
- **`@ForgeMessage`** — override per-route success message
- **`@ForgeRawResponse`** — opt a route out of envelope wrapping
- **`@ApiForge`** — apply filter + interceptor to a single controller without going global
- **`ApiForgeModule.forRoot()`** — one-line global registration
- **`ApiForgeModule.forRootAsync()`** — config-service-driven async options
- **Request ID tracing** — optional UUID `requestId` in every response `meta`

---

## Installation

```bash
npm install nestjs-api-forge
```

---

## Quick Start

### 1. Register globally in `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ApiForgeModule } from 'nestjs-api-forge';

@Module({
  imports: [
    ApiForgeModule.forRoot({
      version: '1.0.0',
      defaultSuccessMessage: 'Request successful',
      includePath: true,
      includeTimestamp: true,
      includeRequestId: true,
    }),
  ],
})
export class AppModule {}
```

Every route in your application now returns a standardized response automatically.

### 2. Add `ValidationPipe` in `main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

The exception filter automatically parses `ValidationPipe` errors and formats them into `error.details`.

---

## Response Shapes

### Success (`2xx`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" },
  "meta": {
    "timestamp": "2026-05-15T10:00:00.000Z",
    "path": "/api/users/1",
    "version": "1.0.0",
    "requestId": "a3f2c1d0-84e5-4b6a-9123-abc123def456"
  }
}
```

### Error (`4xx` / `5xx`)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found",
  "error": {
    "code": "NOT_FOUND"
  },
  "meta": {
    "timestamp": "2026-05-15T10:00:00.000Z",
    "path": "/api/users/99",
    "version": "1.0.0",
    "requestId": "b1e2f3a4-0000-4b5c-8d9e-fedcba987654"
  }
}
```

### Validation Error (from `ValidationPipe`)

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "email", "message": "must be an email" },
      { "field": "age", "message": "must be an integer number" }
    ]
  },
  "meta": {
    "timestamp": "2026-05-15T10:00:00.000Z",
    "path": "/api/users"
  }
}
```

### Paginated (`ApiResponseDto.paginated()`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": [ { "id": 1, "name": "Alice Johnson" } ],
  "pagination": {
    "total": 42,
    "page": 2,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": true
  },
  "meta": {
    "timestamp": "2026-05-15T10:00:00.000Z",
    "path": "/api/users?page=2&limit=10"
  }
}
```

---

## API Reference

### `ApiForgeModule.forRoot(options?)`

| Option | Type | Default | Description |
|---|---|---|---|
| `includePath` | `boolean` | `true` | Include request path in `meta` |
| `includeTimestamp` | `boolean` | `true` | Include ISO timestamp in `meta` |
| `includeRequestId` | `boolean` | `false` | Attach a generated UUID to `meta.requestId` |
| `version` | `string` | `undefined` | API version string added to `meta` |
| `defaultSuccessMessage` | `string` | `'Request successful'` | Fallback success message |

### `ApiForgeModule.forRootAsync(asyncOptions)`

```typescript
ApiForgeModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    version: config.get('API_VERSION'),
    defaultSuccessMessage: config.get('DEFAULT_SUCCESS_MSG'),
    includeRequestId: true,
  }),
})
```

### Decorators

| Decorator | Scope | Description |
|---|---|---|
| `@ApiForge(options?)` | Controller / Method | Apply filter + interceptor without going global |
| `@ForgeMessage(msg)` | Controller / Method | Override the success message for that route |
| `@ForgeRawResponse()` | Controller / Method | Skip envelope wrapping; return raw handler value |

### `ApiResponseDto` — manual usage

```typescript
import { ApiResponseDto } from 'nestjs-api-forge';

// Success
ApiResponseDto.success(data, 'User fetched', 200, { path: '/users/1' });

// Created (201)
ApiResponseDto.created(data, 'User created');

// No content (204)
ApiResponseDto.noContent('Deleted');

// Paginated
ApiResponseDto.paginated(data, total, page, limit, 'Users fetched');

// Error
ApiResponseDto.error('Not found', 404, { code: 'NOT_FOUND' });
```

### Built-in Exceptions

All exceptions extend `ApiException` → `HttpException` and produce a structured error body.

| Class | Status | Code |
|---|---|---|
| `BadRequestException` | 400 | `BAD_REQUEST` |
| `UnauthorizedException` | 401 | `UNAUTHORIZED` |
| `PaymentRequiredException` | 402 | `PAYMENT_REQUIRED` |
| `ForbiddenException` | 403 | `FORBIDDEN` |
| `NotFoundException` | 404 | `NOT_FOUND` |
| `MethodNotAllowedException` | 405 | `METHOD_NOT_ALLOWED` |
| `ConflictException` | 409 | `CONFLICT` |
| `UnprocessableEntityException` | 422 | `UNPROCESSABLE_ENTITY` |
| `TooManyRequestsException` | 429 | `TOO_MANY_REQUESTS` |
| `InternalServerException` | 500 | `INTERNAL_SERVER_ERROR` |
| `ServiceUnavailableException` | 503 | `SERVICE_UNAVAILABLE` |
| `GatewayTimeoutException` | 504 | `GATEWAY_TIMEOUT` |
| `ValidationException` | 400 | `VALIDATION_ERROR` |

---

## Usage Examples

### Standard CRUD controller

```typescript
import { Controller, Get, Post, Delete, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ForgeMessage, ForgeRawResponse, NotFoundException } from 'nestjs-api-forge';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ForgeMessage('User fetched successfully')
  findOne(@Param('id') id: number) {
    const user = this.usersService.findById(id);
    if (!user) throw new NotFoundException('User');
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    this.usersService.remove(id);
  }
}
```

### Paginated list (skip envelope, build manually)

```typescript
import { ApiResponseDto, ForgeRawResponse } from 'nestjs-api-forge';

@Get()
@ForgeRawResponse()
findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
  const p = parseInt(page, 10);
  const l = parseInt(limit, 10);
  const { data, total } = this.usersService.findAll(p, l);
  return ApiResponseDto.paginated(data, total, p, l, 'Users fetched');
}
```

### Per-controller scope (no global module)

```typescript
import { ApiForge, ForgeMessage } from 'nestjs-api-forge';

@Controller('products')
@ApiForge({ version: '2.0' })
export class ProductsController {
  @Get()
  @ForgeMessage('Products fetched successfully')
  findAll() {
    return this.productsService.findAll();
  }
}
```

### Raw response (health check)

```typescript
@Get('health')
@ForgeRawResponse()
health() {
  return { status: 'ok', uptime: process.uptime() };
}
```

### Custom exception with field details

```typescript
import { BadRequestException, ValidationException } from 'nestjs-api-forge';

// With field-level details
throw new BadRequestException('Invalid input', [
  { field: 'price', message: 'Must be a positive number', value: -5 },
]);

// From class-validator constraints map
throw ValidationException.fromConstraints({
  email: { isEmail: 'must be an email' },
  age: { min: 'must be at least 1' },
});
```

---

## Peer Dependencies

```
@nestjs/common  ^9 | ^10 | ^11
@nestjs/core    ^9 | ^10 | ^11
reflect-metadata ^0.1 | ^0.2
rxjs            ^7
```

---

## License

MIT
