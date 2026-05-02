# Publishing Guide — nestjs-api-forge

Complete step-by-step guide for publishing and maintaining `nestjs-api-forge` on [npmjs.com](https://www.npmjs.com).

---

## Prerequisites

- Node.js `>= 16`
- npm `>= 8`
- An npm account at [npmjs.com](https://www.npmjs.com/signup)
- Git installed and configured

---

## First-Time Setup

### 1. Create an npm account

Go to [https://www.npmjs.com/signup](https://www.npmjs.com/signup) and create a free account if you don't have one.

### 2. Login to npm in your terminal

```bash
npm login
```

Enter your **username**, **password**, and **email** when prompted. If you have 2FA enabled, enter the OTP code as well.

Verify you are logged in:

```bash
npm whoami
# Output: mirzasaikatahmmed
```

---

## Pre-Publish Checklist

Before every publish, go through this checklist:

- [ ] All source changes are saved in `src/`
- [ ] `version` in `package.json` is bumped (see [Versioning](#versioning))
- [ ] `README.md` is up to date
- [ ] Build passes with no errors (`npm run build`)
- [ ] `dist/` folder exists and is not empty
- [ ] You are on the correct npm account (`npm whoami`)

---

## Build the Package

```bash
cd nestjs-api-forge
npm run build
```

This compiles TypeScript from `src/` into `dist/` (JS + `.d.ts` type declarations).

The `prepublishOnly` script in `package.json` runs `npm run build` automatically before every publish, but running it manually first lets you catch errors early.

---

## Preview What Will Be Published

```bash
npm pack --dry-run
```

This lists every file that would be included in the tarball without actually creating it. Only files matching the `"files"` field in `package.json` are included:

```json
"files": ["dist/**/*"]
```

You can also create an actual tarball to inspect it:

```bash
npm pack
# Creates: nestjs-api-forge-1.0.0.tgz
tar -tzf nestjs-api-forge-1.0.0.tgz
```

Delete the `.tgz` file after inspection — it is not needed for publishing.

---

## Versioning

Follow [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`

| Change type | Command | Example |
|---|---|---|
| Bug fix / patch | `npm version patch` | `1.0.0` → `1.0.1` |
| New feature (backward-compatible) | `npm version minor` | `1.0.0` → `1.1.0` |
| Breaking change | `npm version major` | `1.0.0` → `2.0.0` |
| Pre-release (beta) | `npm version prerelease --preid=beta` | `1.0.0` → `1.0.1-beta.0` |

These commands update `package.json` and create a git tag automatically.

---

## Publish to npm

### Publish a stable release

```bash
npm publish --access public
```

> `--access public` is required for unscoped packages on a free npm account. It is safe to include it every time.

### Publish a beta / pre-release

```bash
npm version prerelease --preid=beta
npm publish --tag beta --access public
```

Users install a beta explicitly with:

```bash
npm install nestjs-api-forge@beta
```

The `latest` tag on npm always points to the last stable release.

---

## Verify the Published Package

After publishing, confirm the package is live:

```bash
npm info nestjs-api-forge
```

Or visit:

```
https://www.npmjs.com/package/nestjs-api-forge
```

Test installing it in a separate project:

```bash
mkdir /tmp/test-forge && cd /tmp/test-forge
npm init -y
npm install nestjs-api-forge
node -e "const pkg = require('nestjs-api-forge'); console.log(Object.keys(pkg));"
```

---

## Publishing a New Version (Repeat Flow)

```bash
# 1. Make your changes in src/

# 2. Bump the version
npm version patch   # or minor / major

# 3. Build
npm run build

# 4. Publish
npm publish --access public

# 5. Push the version commit and git tag
git push && git push --tags
```

---

## Unpublish / Deprecate

> npm allows unpublishing only within 72 hours of publish and only if the package has zero dependents.

```bash
# Deprecate (preferred — keeps the package but shows a warning)
npm deprecate nestjs-api-forge@"< 2.0.0" "Deprecated: upgrade to v2"

# Unpublish a specific version (within 72 h)
npm unpublish nestjs-api-forge@1.0.0

# Unpublish the entire package (within 72 h, no dependents)
npm unpublish nestjs-api-forge --force
```

---

## Two-Factor Authentication (Recommended)

Enable 2FA on your npm account for extra security:

1. Go to [https://www.npmjs.com/settings/~/profile](https://www.npmjs.com/settings/~/profile)
2. Click **Two-Factor Authentication** → **Enable 2FA**
3. Choose **Authorization and Publishing**

After enabling, every `npm publish` will ask for an OTP code.

---

## npm Automation Token (CI/CD)

To publish from GitHub Actions or another CI pipeline without interactive login:

1. Go to **npmjs.com → Account → Access Tokens → Generate New Token**
2. Choose type **Automation**
3. Copy the token and add it as a repository secret named `NPM_TOKEN`

Example GitHub Actions workflow (`.github/workflows/publish.yml`):

```yaml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Package Links

| Resource | URL |
|---|---|
| npm page | https://www.npmjs.com/package/nestjs-api-forge |
| GitHub repo | https://github.com/mirzasaikatahmmed/nestjs-api-forge |
| Issues | https://github.com/mirzasaikatahmmed/nestjs-api-forge/issues |
