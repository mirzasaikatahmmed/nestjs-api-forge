# nestjs-api-forge

[![CI](https://img.shields.io/github/actions/workflow/status/mirzasaikatahmmed/nestjs-api-forge/publish.yml?label=build)](https://github.com/mirzasaikatahmmed/nestjs-api-forge/actions/workflows/publish.yml)
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
- **`@ForgeMeta`** — merge custom fields into `meta` per route or controller
- **`@ForgeDeprecated`** — mark a route as deprecated (adds `meta.deprecated` + `Deprecation` header)
- **`@ApiForge`** — apply filter + interceptor to a single controller without going global
- **`ForgeValidationPipe`** — drop-in `ValidationPipe` that throws structured `ValidationException` with typed field details
- **`ApiForgeModule.forRoot()`** — one-line global registration
- **`ApiForgeModule.forRootAsync()`** — config-service-driven async options
- **Correlation ID passthrough** — read `X-Request-ID` / `X-Correlation-ID` from requests, echo on responses
- **Response time** — optional `meta.responseTime` for every response
- **Request ID tracing** — optional auto-generated UUID `requestId` in every response `meta`

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
      includeResponseTime: true,
      correlationIdHeader: 'x-request-id',
    }),
  ],
})
export class AppModule {}
```

### 2. Use `ForgeValidationPipe` in `main.ts`

```typescript
import { ForgeValidationPipe } from 'nestjs-api-forge';

app.useGlobalPipes(new ForgeValidationPipe());
```

`ForgeValidationPipe` extends NestJS `ValidationPipe` and throws a structured `ValidationException` with typed field-level details — no string parsing required.

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
    "requestId": "a3f2c1d0-84e5-4b6a-9123-abc123def456",
    "responseTime": "4ms"
  }
}
```

### Error (`4xx` / `5xx`)

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found",
  "error": { "code": "NOT_FOUND" },
  "meta": {
    "timestamp": "2026-05-15T10:00:00.000Z",
    "path": "/api/users/99",
    "version": "1.0.0",
    "requestId": "b1e2f3a4-0000-4b5c-8d9e-fedcba987654",
    "responseTime": "2ms"
  }
}
```

### Validation Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "email", "message": "must be an email" },
      { "field": "address.zip", "message": "must be a string" }
    ]
  },
  "meta": { "timestamp": "2026-05-15T10:00:00.000Z", "path": "/api/users" }
}
```

### Paginated

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": [{ "id": 1, "name": "Alice Johnson" }],
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
    "path": "/api/users?page=2&limit=10",
    "responseTime": "8ms"
  }
}
```

### Deprecated route

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": { },
  "meta": {
    "timestamp": "2026-05-15T10:00:00.000Z",
    "deprecated": true,
    "deprecationNotice": "Use /v2/users instead"
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
| `includeRequestId` | `boolean` | `false` | Auto-generate UUID `requestId` in `meta` if no correlation header found |
| `correlationIdHeader` | `string \| string[]` | `['x-request-id', 'x-correlation-id']` | Header(s) to read request ID from; echoed back on the response |
| `includeResponseTime` | `boolean` | `false` | Include handler duration as `meta.responseTime` (e.g. `"12ms"`) |
| `version` | `string` | `undefined` | API version string added to `meta` |
| `defaultSuccessMessage` | `string` | `'Request successful'` | Fallback success message |

### `ApiForgeModule.forRootAsync(asyncOptions)`

```typescript
ApiForgeModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    version: config.get('API_VERSION'),
    includeRequestId: true,
    includeResponseTime: true,
    correlationIdHeader: config.get('CORRELATION_HEADER'),
  }),
})
```

### Decorators

| Decorator | Scope | Description |
|---|---|---|
| `@ApiForge(options?)` | Controller / Method | Apply filter + interceptor without going global |
| `@ForgeMessage(msg)` | Controller / Method | Override the success message for that route |
| `@ForgeRawResponse()` | Controller / Method | Skip envelope wrapping; return raw handler value |
| `@ForgeMeta(extra)` | Controller / Method | Merge extra key-value pairs into `meta` |
| `@ForgeDeprecated(notice?)` | Controller / Method | Mark route deprecated — adds `meta.deprecated`, optional `meta.deprecationNotice`, and `Deprecation: true` header |

### `ForgeValidationPipe`

Drop-in replacement for NestJS `ValidationPipe`. Throws `ValidationException` with structured `details` instead of a string-message array. Supports nested objects (dot-notation fields).

```typescript
// main.ts
app.useGlobalPipes(new ForgeValidationPipe());

// Override defaults
app.useGlobalPipes(new ForgeValidationPipe({
  whitelist: false,
  forbidNonWhitelisted: false,
}));
```

### `ApiResponseDto` — manual usage

```typescript
import { ApiResponseDto } from 'nestjs-api-forge';

ApiResponseDto.success(data, 'OK', 200, { path: '/users/1' });
ApiResponseDto.created(data, 'User created');
ApiResponseDto.accepted(jobRef, 'Export queued');   // 202
ApiResponseDto.noContent('Deleted');                // 204
ApiResponseDto.paginated(data, total, page, limit, 'Users fetched');
ApiResponseDto.error('Not found', 404, { code: 'NOT_FOUND' });
```

### Built-in Exceptions

All extend `ApiException` → `HttpException`.

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
import { ForgeMessage, ForgeRawResponse, ForgeDeprecated, NotFoundException } from 'nestjs-api-forge';

@Controller('users')
export class UsersController {
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

### Deprecated route

```typescript
@Get('export')
@ForgeDeprecated('Use POST /v2/users/export instead')
@ForgeMessage('Export started')
startExport() {
  const job = this.usersService.queueExport();
  return ApiResponseDto.accepted({ jobId: job.id }, 'Export queued');
}
```

### Custom meta per route

```typescript
@Get()
@ForgeMeta({ region: 'us-east-1', cache: 'miss' })
findAll() {
  return this.usersService.findAll();
}
```

### Paginated list (raw response)

```typescript
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
@Controller('products')
@ApiForge({ version: '2.0', includeResponseTime: true })
export class ProductsController { ... }
```

### Raw response (health check)

```typescript
@Get('health')
@ForgeRawResponse()
health() {
  return { status: 'ok', uptime: process.uptime() };
}
```

### Correlation ID tracing

Send `X-Request-ID: abc-123` in the request — the same ID appears in `meta.requestId` and is echoed in the `X-Request-ID` response header. Useful for distributed tracing across microservices.

```typescript
ApiForgeModule.forRoot({
  correlationIdHeader: 'x-request-id',  // or an array of headers
  includeRequestId: true,               // generate UUID if header is absent
})
```

### Custom exception with field details

```typescript
throw new BadRequestException('Invalid input', [
  { field: 'price', message: 'Must be a positive number', value: -5 },
]);

// From class-validator constraint map
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

## Changelog

### 1.1.0
- `ForgeValidationPipe` — structured validation errors with nested field support
- `@ForgeMeta(extra)` decorator — merge custom fields into response meta
- `@ForgeDeprecated(notice?)` decorator — deprecation flag in meta + response header
- `ApiResponseDto.accepted()` — 202 helper
- Correlation ID passthrough (`correlationIdHeader` option)
- Response time measurement (`includeResponseTime` option)
- `forRootAsync` fix — options factory now runs once instead of twice
- 3 new exceptions: `MethodNotAllowedException`, `PaymentRequiredException`, `GatewayTimeoutException`

---

## License

MIT
