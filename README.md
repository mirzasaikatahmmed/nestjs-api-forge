# nestjs-api-forge

Standardized API response formatting, structured error handling, and exception filters for [NestJS](https://nestjs.com/) applications.

## Features

- **Uniform success response** envelope wrapping all handler return values
- **Structured error responses** with `code`, `message`, and optional `details` array
- **Global exception filter** that handles `HttpException`, `ValidationPipe` errors, and unexpected exceptions
- **Built-in typed exceptions** (`NotFoundException`, `UnauthorizedException`, `ValidationException`, etc.)
- **`@ForgeMessage`** decorator to override per-route success messages
- **`@ForgeRawResponse`** decorator to opt a route out of wrapping
- **`ApiForgeModule.forRoot()`** for one-line global registration
- **`ApiForgeModule.forRootAsync()`** for config-service-driven options

---

## Installation

```bash
npm install nestjs-api-forge
```

---

## Quick Start

### 1. Register globally (`app.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { ApiForgeModule } from 'nestjs-api-forge';

@Module({
  imports: [
    ApiForgeModule.forRoot({
      version: '1.0',
      defaultSuccessMessage: 'OK',
      includePath: true,
      includeTimestamp: true,
    }),
  ],
})
export class AppModule {}
```

Every route in your application will now return a standardized response automatically.

---

## Response Formats

### Success

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request successful",
  "data": { "id": 1, "name": "Alice" },
  "meta": {
    "timestamp": "2026-05-02T10:00:00.000Z",
    "path": "/api/users/1",
    "version": "1.0"
  }
}
```

### Error

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found",
  "error": {
    "code": "NOT_FOUND"
  },
  "meta": {
    "timestamp": "2026-05-02T10:00:00.000Z",
    "path": "/api/users/99",
    "version": "1.0"
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
      { "field": "password", "message": "must be longer than 8 characters" }
    ]
  },
  "meta": {
    "timestamp": "2026-05-02T10:00:00.000Z",
    "path": "/api/auth/register"
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
| `version` | `string` | `undefined` | API version string added to `meta` |
| `defaultSuccessMessage` | `string` | `'Request successful'` | Default success message |

### Decorators

| Decorator | Scope | Description |
|---|---|---|
| `@ApiForge(options?)` | Controller / Method | Apply filter + interceptor to a single controller or method |
| `@ForgeMessage(msg)` | Controller / Method | Override the success message for that route |
| `@ForgeRawResponse()` | Controller / Method | Skip response wrapping; return handler value as-is |

### Built-in Exceptions

All exceptions extend `ApiException` which extends NestJS's `HttpException`.

| Class | Status | Code |
|---|---|---|
| `BadRequestException` | 400 | `BAD_REQUEST` |
| `UnauthorizedException` | 401 | `UNAUTHORIZED` |
| `ForbiddenException` | 403 | `FORBIDDEN` |
| `NotFoundException` | 404 | `NOT_FOUND` |
| `ConflictException` | 409 | `CONFLICT` |
| `UnprocessableEntityException` | 422 | `UNPROCESSABLE_ENTITY` |
| `TooManyRequestsException` | 429 | `TOO_MANY_REQUESTS` |
| `InternalServerException` | 500 | `INTERNAL_SERVER_ERROR` |
| `ServiceUnavailableException` | 503 | `SERVICE_UNAVAILABLE` |
| `ValidationException` | 400 | `VALIDATION_ERROR` |

### `ApiResponseDto` (manual usage)

```typescript
import { ApiResponseDto } from 'nestjs-api-forge';

ApiResponseDto.success(data, 'User fetched', 200, { path: '/users/1' });
ApiResponseDto.created(data, 'User created');
ApiResponseDto.noContent('Deleted');
ApiResponseDto.error('Not found', 404, { code: 'NOT_FOUND' });
```

---

## Usage Examples

### Controller with custom message

```typescript
import { Controller, Get, Param } from '@nestjs/common';
import { ForgeMessage, NotFoundException } from 'nestjs-api-forge';

@Controller('users')
export class UsersController {
  @Get(':id')
  @ForgeMessage('User fetched successfully')
  findOne(@Param('id') id: string) {
    const user = this.usersService.findById(+id);
    if (!user) throw new NotFoundException('User');
    return user;
  }
}
```

### Skip wrapping for a specific route

```typescript
@Get('health')
@ForgeRawResponse()
healthCheck() {
  return { status: 'ok' };
}
```

### Async module registration (with ConfigService)

```typescript
ApiForgeModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    version: config.get('API_VERSION'),
    defaultSuccessMessage: config.get('DEFAULT_SUCCESS_MSG'),
  }),
})
```

### Use with `ValidationPipe`

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

The exception filter automatically parses `ValidationPipe` error arrays and formats them into `error.details`.

---

## License

MIT
