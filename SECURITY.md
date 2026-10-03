# Security Policy

## Supported Versions

Security fixes are released for the latest published version of `nestjs-api-forge` only. Please upgrade before reporting an issue.

| Version | Supported |
|---------|-----------|
| Latest 1.x | Yes |
| Older versions | No |

## Reporting a Vulnerability

**Please do not open a public issue for security problems.**

Report it privately through GitHub:

1. Go to the [Security tab](https://github.com/mirzasaikatahmmed/nestjs-api-forge/security/advisories/new) of this repository.
2. Click **Report a vulnerability** and describe the issue.

Please include:

- The affected version (`npm list nestjs-api-forge`) and NestJS version
- Steps to reproduce, or a minimal proof of concept
- The impact you expect (for example, information leakage in error responses)

## What to Expect

- You will get an acknowledgement within a few days. This is a volunteer-maintained project, so response times are best effort.
- If the report is accepted, a fix is prepared privately, released, and published with a GitHub security advisory crediting you (unless you prefer to stay anonymous).
- If the report is declined, you will get an explanation.

## Scope

In scope: the published `nestjs-api-forge` package (code under `src/`), for example sensitive data exposed in error responses or the health endpoint.

Out of scope: vulnerabilities in NestJS or other third-party dependencies (report those upstream), and issues in the example app under `app/`.
