# Contributing to NestJS API Forge

Thanks for taking the time to contribute! This guide covers everything you need to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## Code of Conduct

This project follows a [Code of Conduct](CODE_OF_CONDUCT.md). By participating you agree to abide by its terms. Report violations to **contact@saikat.com.bd**.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v7 or higher
- A basic understanding of [NestJS](https://nestjs.com/) and TypeScript

### Fork & Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/nestjs-api-forge.git
cd nestjs-api-forge
```

Add the original repository as an upstream remote:

```bash
git remote add upstream https://github.com/mirzasaikatahmmed/nestjs-api-forge.git
```

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
# or watch mode:
npm run build:watch
```

---

## Project Structure

```
nestjs-api-forge/
├── src/
│   ├── api-forge.module.ts         # forRoot / forRootAsync — module registration
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
├── app/                            # Example NestJS app — use this to test changes manually
│   └── src/
│       ├── users/
│       └── products/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/
└── package.json
```

---

## Development Workflow

### Running Locally

After building, link the library to test it inside the example app:

```bash
# Build the library
npm run build

# In the example app
cd app
npm install
npm link ../          # link local nestjs-api-forge build
npm run start:dev
```

Now changes you make to `src/` are reflected in the example app after a rebuild.

### Manual Testing

The project does not yet have a test suite. When adding new functionality, manually verify:

1. The happy path — the expected response shape is returned
2. Error paths — exceptions return the correct structured error
3. Edge cases specific to your change (e.g., missing options, nested validation fields)

Contributions to the test infrastructure are very welcome — open a PR if you add tests.

### Formatting

```bash
npm run format    # Prettier over all TS files in src/
```

Match the style of the surrounding code for any area not covered by Prettier.

---

## Making Changes

1. Create a branch from `main`:

   ```bash
   git checkout -b feat/your-feature
   # or
   git checkout -b fix/your-bug
   ```

2. Make your changes in `src/`.

3. Rebuild:

   ```bash
   npm run build
   ```

4. Test manually using the example app in `app/`.

5. Run Prettier before committing:

   ```bash
   npm run format
   ```

### Key Source Areas

| File | What to touch |
|------|--------------|
| `api-forge.module.ts` | `forRoot` / `forRootAsync` options and provider wiring |
| `response.interceptor.ts` | Response envelope shape, meta fields, raw response skip logic |
| `global-exception.filter.ts` | Exception handling, error shape, correlation ID echoing |
| `forge-validation.pipe.ts` | Validation error transformation and field detail mapping |
| `api-response.dto.ts` | Static response builder methods |
| `api-response.interface.ts` | TypeScript types and `ForgeOptions` interface |
| `decorators/api-response.decorator.ts` | Decorator definitions and metadata keys |

---

## Commit Guidelines

Commits in this project use emoji prefixes. Follow this guide when writing commit messages manually:

| Prefix | When to use |
|--------|------------|
| `✨ feat:` | New feature or decorator |
| `🐛 fix:` | Bug fix |
| `🔒 security:` | Security improvement |
| `♻️ refactor:` | Code change with no behaviour change |
| `📝 docs:` | Documentation only |
| `🏗️ build:` | Build system or dependency change |
| `✅ test:` | Adding or fixing tests |
| `🚀 ci:` | CI/CD changes |
| `📦 chore:` | Version bump or housekeeping |

Keep the subject line under 72 characters. Add a body if the *why* is non-obvious.

---

## Pull Request Process

1. Push your branch and open a PR against `main`.
2. Fill in the PR description: what changed, why, and how you tested it.
3. For major changes (new decorators, interceptor overhaul, breaking interface changes), open an issue first to align on the approach.
4. A maintainer will review within a few days. Address feedback and push to the same branch — the PR updates automatically.
5. Once approved, the maintainer will merge and include your change in the next npm release.

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/mirzasaikatahmmed/nestjs-api-forge/issues) using the **Bug Report** template and include:

- `nestjs-api-forge` version (`npm list nestjs-api-forge`)
- NestJS version (`npm list @nestjs/common`)
- Node.js version (`node -v`)
- OS and shell
- Minimal reproduction steps
- What you expected vs. what actually happened
- Any error output or stack trace

---

## Suggesting Features

Open an issue with the `enhancement` label. Describe the use case — not just what you want, but *why*. If you're ready to implement it, mention that in the issue so we can discuss the approach before you write code.

---

## Questions?

Open an issue or reach out to [Mirza Saikat Ahmmed](https://github.com/mirzasaikatahmmed).
