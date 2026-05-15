<div align="center">

# ⚡ NestJS API Forge

**Plug-and-play response envelope, exception filter, and error formatting for NestJS REST APIs — zero boilerplate, fully typed.**

[![npm version](https://img.shields.io/npm/v/nestjs-api-forge?color=blue&label=npm)](https://www.npmjs.com/package/nestjs-api-forge)
[![npm downloads](https://img.shields.io/npm/dm/nestjs-api-forge?color=green)](https://www.npmjs.com/package/nestjs-api-forge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NestJS](https://img.shields.io/badge/NestJS-%3E%3D9-red)](https://nestjs.com)
[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-3178c6)](https://www.typescriptlang.org)
[![CI](https://img.shields.io/github/actions/workflow/status/mirzasaikatahmmed/nestjs-api-forge/publish.yml?label=build)](https://github.com/mirzasaikatahmmed/nestjs-api-forge/actions/workflows/publish.yml)
[![Sponsor](https://img.shields.io/badge/Sponsor-%E2%9D%A4-ea4aaa?logo=github-sponsors)](https://github.com/sponsors/mirzasaikatahmmed)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-yellow?logo=buy-me-a-coffee)](https://buymeacoffee.com/saikat)

<br/>

> One import to standardize every response, every error, and every validation in your NestJS API.

</div>

---

## 🧩 What it does

Register `ApiForgeModule` once and every response from your API is automatically shaped into a consistent envelope. No more manual `{ success, data, message }` wrappers scattered across controllers.

| Layer | What Forge provides |
|-------|-------------------|
| 📦 | **Response envelope** — every handler wrapped with `success`, `statusCode`, `message`, `data`, and `meta` |
| 🛡️ | **Global exception filter** — handles `HttpException`, validation errors, and unexpected crashes uniformly |
| ✅ | **Structured validation** — `ForgeValidationPipe` replaces `ValidationPipe` with typed field-level error details |
| 📄 | **Paginated responses** — `ApiResponseDto.paginated()` with full pagination meta in one call |
| 🏷️ | **Per-route decorators** — override messages, skip wrapping, add custom meta, or mark routes deprecated |
| 🔍 | **Request tracing** — correlation ID passthrough, auto UUID generation, and response time measurement |
| 💥 | **Typed exceptions** — drop-in replacements for every NestJS `HttpException` with structured error codes |

### Decorators at a glance

| Decorator | Scope | Description |
|-----------|-------|-------------|
| `@ApiForge(options?)` | Controller / Method | Apply filter + interceptor without going global |
| `@ForgeMessage(msg)` | Controller / Method | Override the success message for that route |
| `@ForgeRawResponse()` | Controller / Method | Skip envelope wrapping — return raw handler value |
| `@ForgeMeta(extra)` | Controller / Method | Merge extra key-value pairs into `meta` |
| `@ForgeDeprecated(notice?)` | Controller / Method | Mark route deprecated — adds `meta.deprecated` + `Deprecation` header |

---

## 📦 Installation

### Requirements

- **Node.js** v18 or higher
- **NestJS** v9, v10, or v11

### Install

```bash
npm install nestjs-api-forge
```

Verify the install:

```bash
node -e "require('nestjs-api-forge'); console.log('nestjs-api-forge installed')"
```

---

## 🚀 Quick Start

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

### 2. Add `ForgeValidationPipe` in `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ForgeValidationPipe } from 'nestjs-api-forge';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ForgeValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

That's it. Every response is now wrapped, every error is structured, and every validation failure returns typed field details.

---

## 📐 Response Shapes

### Success (`2xx`)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": { "id": 1, "name": "Alice Johnson", "email": "alice@example.com" },
  "meta": {
    "timestamp": "2025-01-15T10:00:00.000Z",
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
    "timestamp": "2025-01-15T10:00:00.000Z",
    "path": "/api/users/99",
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
  "meta": { "timestamp": "2025-01-15T10:00:00.000Z", "path": "/api/users" }
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
    "timestamp": "2025-01-15T10:00:00.000Z",
    "path": "/api/users?page=2&limit=10",
    "responseTime": "8ms"
  }
}
```

### Deprecated Route

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {},
  "meta": {
    "timestamp": "2025-01-15T10:00:00.000Z",
    "deprecated": true,
    "deprecationNotice": "Use /v2/users instead"
  }
}
```

---

## 📖 API Reference

### `ApiForgeModule.forRoot(options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includePath` | `boolean` | `true` | Include request path in `meta` |
| `includeTimestamp` | `boolean` | `true` | Include ISO timestamp in `meta` |
| `includeRequestId` | `boolean` | `false` | Auto-generate UUID `requestId` in `meta` if no correlation header found |
| `correlationIdHeader` | `string \| string[]` | `['x-request-id', 'x-correlation-id']` | Header(s) to read request ID from; echoed back on the response |
| `includeResponseTime` | `boolean` | `false` | Include handler duration as `meta.responseTime` (e.g. `"12ms"`) |
| `version` | `string` | `undefined` | API version string added to `meta` |
| `defaultSuccessMessage` | `string` | `'Request successful'` | Fallback success message |

### `ApiForgeModule.forRootAsync(asyncOptions)`

Use when options depend on a config service:

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

### `ForgeValidationPipe`

Drop-in replacement for NestJS `ValidationPipe`. Throws `ValidationException` with structured `details` instead of a string-message array. Supports nested objects using dot-notation field paths.

```typescript
// Use defaults
app.useGlobalPipes(new ForgeValidationPipe());

// Override defaults
app.useGlobalPipes(new ForgeValidationPipe({
  whitelist: false,
  forbidNonWhitelisted: false,
}));
```

### `ApiResponseDto` — manual builders

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

All extend `ApiException` → `HttpException`. Pass an optional message and `details` array to any of them.

| Class | Status | Code |
|-------|--------|------|
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

## 💡 Usage Examples

### Standard CRUD controller

```typescript
import { Controller, Get, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ForgeMessage, NotFoundException } from 'nestjs-api-forge';

@Controller('users')
export class UsersController {
  @Get(':id')
  @ForgeMessage('User fetched successfully')
  findOne(@Param('id') id: number) {
    const user = this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    this.usersService.remove(id);
  }
}
```

### Paginated list

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

Send `X-Request-ID: abc-123` in the request — the same ID appears in `meta.requestId` and is echoed in the response header. Useful for distributed tracing across microservices.

```typescript
ApiForgeModule.forRoot({
  correlationIdHeader: 'x-request-id',   // or an array of headers
  includeRequestId: true,                // generate UUID if header is absent
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

## 📁 Project Structure

```
nestjs-api-forge/
├── src/
│   ├── api-forge.module.ts         # forRoot / forRootAsync registration
│   ├── index.ts                    # Public exports
│   ├── decorators/
│   │   └── api-response.decorator.ts  # @ApiForge, @ForgeMessage, @ForgeRawResponse, @ForgeMeta, @ForgeDeprecated
│   ├── dto/
│   │   └── api-response.dto.ts        # ApiResponseDto static builders
│   ├── exceptions/
│   │   ├── api.exception.ts           # Base ApiException class
│   │   └── validation.exception.ts    # ValidationException with field details
│   ├── filters/
│   │   └── global-exception.filter.ts # ForgeExceptionFilter
│   ├── interceptors/
│   │   └── response.interceptor.ts    # ForgeResponseInterceptor
│   ├── interfaces/
│   │   └── api-response.interface.ts  # TypeScript interfaces and ForgeOptions
│   ├── pipes/
│   │   └── forge-validation.pipe.ts   # ForgeValidationPipe
│   └── utils/
│       └── error-code.util.ts
├── app/                            # Example NestJS app demonstrating the library
│   └── src/
│       ├── users/                  # Full CRUD example with pagination
│       └── products/               # Per-controller @ApiForge example
├── .github/
│   ├── ISSUE_TEMPLATE/            # Bug report & feature request templates
│   └── workflows/
│       ├── publish.yml            # npm publish on tag push
│       └── malware-scan.yml       # Security scan on every push
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
└── package.json
```

---

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/mirzasaikatahmmed/nestjs-api-forge.git
cd nestjs-api-forge

# Install dependencies
npm install

# Build the library
npm run build

# Watch mode
npm run build:watch

# Format code
npm run format

# Run the example app
cd app && npm install && npm run start:dev
```

---

## 📦 Peer Dependencies

```
@nestjs/common   ^9 | ^10 | ^11
@nestjs/core     ^9 | ^10 | ^11
reflect-metadata ^0.1 | ^0.2
rxjs             ^7
```

---

## 📋 Changelog

### v1.0.6 — Current
- **Changelog updated** — all versions documented with accurate entries aligned to npm release history

### v1.0.5
- **Open source documentation** — full README rewrite with badges, "What it does" table, response shape examples, and complete API reference
- **Community health files** — `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTORS.md`, `REPOSITORY_RULES.md`
- **GitHub templates** — bug report and feature request issue templates, `FUNDING.yml`, `CODEOWNERS`
- **ESLint setup** — ESLint v10 flat config (`eslint.config.mjs`) with `@typescript-eslint` integration; `npm run lint` now works out of the box

### v1.0.4
- `ForgeValidationPipe` — structured validation errors with nested field support (dot-notation)
- `@ForgeMeta(extra)` — merge custom fields into response `meta` per route or controller
- `@ForgeDeprecated(notice?)` — deprecation flag in `meta` + `Deprecation: true` response header
- `@ForgeMessage`, `@ForgeRawResponse`, `@ApiForge` decorators
- `ApiResponseDto.accepted()` — 202 Accepted helper
- Correlation ID passthrough (`correlationIdHeader` option)
- Response time measurement (`includeResponseTime` option)
- `forRootAsync` fix — options factory now runs once instead of twice
- 3 new exceptions: `MethodNotAllowedException`, `PaymentRequiredException`, `GatewayTimeoutException`
- Response metadata support (`includePath`, `includeTimestamp`, `includeRequestId`, `includeResponseTime`)

### v1.0.3
- Update repository URL format in `package.json`

### v1.0.0
- Initial release — `ApiForgeModule.forRoot()`, `ForgeExceptionFilter`, `ForgeResponseInterceptor`, `ApiResponseDto`, and 10 typed exceptions

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss your approach.

1. Fork the repository
2. Create your branch: `git checkout -b feat/your-feature`
3. Make your changes and run `npm run format`
4. Push and open a PR against `main`

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating. All contributors are listed in [CONTRIBUTORS.md](CONTRIBUTORS.md).

---

## 💛 Support

If NestJS API Forge saves you boilerplate, consider supporting the project:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20on%20GitHub-%E2%9D%A4-ea4aaa?logo=github-sponsors&style=for-the-badge)](https://github.com/sponsors/mirzasaikatahmmed)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-☕-yellow?logo=buy-me-a-coffee&style=for-the-badge)](https://buymeacoffee.com/saikat)

---

<div align="center">

Made with ❤️ by [Mirza Saikat Ahmmed](https://github.com/mirzasaikatahmmed)

</div>
