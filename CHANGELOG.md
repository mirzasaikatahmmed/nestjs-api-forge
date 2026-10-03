# Changelog

All notable changes to **nestjs-api-forge** are documented here.

---

## [1.0.10] — 2026-10-03

### Fixed
- **`LockedException` on NestJS 9 and 10** — `HttpStatus.LOCKED` only exists in `@nestjs/common` >= 11, so the exception had an `undefined` status and the package failed to typecheck against Nest 9/10. Status `423` is now used directly (also in the status-to-error-code map)

### Added
- **`LICENSE`** (MIT) is now included in the published package

### Changed
- **CI** — pull requests run lint, typecheck, build, and a Jest suite (71+ tests) on Node 18/20/22 and against NestJS 9, 10, and 11

### Known issues
- `includeTimestamp: false` does not remove `meta.timestamp` yet (covered by `it.failing` tests)

---

## [1.0.9] — 2026-10-03

### Changed
- **CI** — upgraded `actions/checkout` and `actions/setup-node` to v7 and pinned both to commit SHAs. No runtime or API changes

---

## [1.0.8] — 2026-10-03

### Changed
- **Release workflow** — publishing now triggers on `v*` tags (not every push to `main`), verifies the tag matches `package.json`, and runs lint, typecheck, and build before `npm publish --provenance`
- **`package.json`** — added `exports`, `engines` (`node >=18`), and `publishConfig` (`access: public`, `provenance: true`); `prepublishOnly` now cleans `dist` before building
- **Scripts** — added `lint:check` (no auto-fix), `typecheck`, and `clean`

---

## [1.0.7] — 2026-05-16

### Added
- **10 new HTTP exception classes** — covers every commonly used 4xx/5xx status code:
  - `NotAcceptableException` (406)
  - `RequestTimeoutException` (408)
  - `GoneException` (410)
  - `PayloadTooLargeException` (413)
  - `UnsupportedMediaTypeException` (415)
  - `LockedException` (423)
  - `FailedDependencyException` (424)
  - `PreconditionRequiredException` (428)
  - `NotImplementedException` (501)
  - `BadGatewayException` (502)
- **`ForgeHealthModule`** — plug-and-play health check endpoint:
  - `ForgeHealthModule.register(options)` mounts a `/health` route (path is configurable)
  - Returns Forge-formatted `{ status, uptime, version, memory?, checks? }` response
  - Supports named custom health checks (database, cache, etc.) with per-check `ok`/`error` status
  - Throws `ServiceUnavailableException` (503) automatically when any check fails
  - Works transparently with or without `ApiForgeModule` (uses `@ForgeRawResponse()` internally)
  - Options: `path`, `includeUptime`, `includeMemory`, `version`, `checks`
- **Updated `httpStatusToErrorCode` map** — added entries for `LOCKED` (423), `FAILED_DEPENDENCY` (424), and `PRECONDITION_REQUIRED` (428)

---

## [1.0.6] — 2026-05-15

### Changed
- Changelog updated — all versions documented with accurate entries aligned to npm release history

---

## [1.0.5] — 2026-05-14

### Added
- Open source documentation — full README rewrite with badges, "What it does" table, response shape examples, and complete API reference
- Community health files — `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTORS.md`, `REPOSITORY_RULES.md`
- GitHub templates — bug report and feature request issue templates, `FUNDING.yml`, `CODEOWNERS`
- ESLint setup — ESLint v10 flat config (`eslint.config.mjs`) with `@typescript-eslint` integration; `npm run lint` now works out of the box

---

## [1.0.4] — 2026-05-13

### Added
- `ForgeValidationPipe` — structured validation errors with nested field support (dot-notation)
- `@ForgeMeta(extra)` — merge custom fields into response `meta` per route or controller
- `@ForgeDeprecated(notice?)` — deprecation flag in `meta` + `Deprecation: true` response header
- `@ForgeMessage`, `@ForgeRawResponse`, `@ApiForge` decorators
- `ApiResponseDto.accepted()` — 202 Accepted helper
- Correlation ID passthrough (`correlationIdHeader` option)
- Response time measurement (`includeResponseTime` option)
- 3 new exceptions: `MethodNotAllowedException`, `PaymentRequiredException`, `GatewayTimeoutException`
- Response metadata support (`includePath`, `includeTimestamp`, `includeRequestId`, `includeResponseTime`)

### Fixed
- `forRootAsync` — options factory now runs once instead of twice

---

## [1.0.3] — 2026-05-12

### Changed
- Updated repository URL format in `package.json`

---

## [1.0.0] — 2026-05-11

### Added
- Initial release
- `ApiForgeModule.forRoot()` and `ApiForgeModule.forRootAsync()` — global module registration
- `ForgeExceptionFilter` — catches all exceptions and formats them into a consistent error envelope
- `ForgeResponseInterceptor` — wraps all successful responses in a standardized envelope
- `ApiResponseDto` — static helpers: `success()`, `created()`, `paginated()`, `error()`, `noContent()`
- 10 typed HTTP exception classes: `BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `UnprocessableEntityException`, `TooManyRequestsException`, `InternalServerException`, `ServiceUnavailableException`, `PaymentRequiredException`
- `ValidationException` — structured field-level validation errors from class-validator constraints
- `ApiSuccessResponse`, `ApiErrorResponse`, `ApiPaginatedResponse` TypeScript interfaces
- `httpStatusToErrorCode` utility
