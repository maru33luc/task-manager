# Task Manager — Project Memory

## Overview
Full-stack monorepo: Angular 18 frontend + NestJS backend.
- **Frontend**: `frontend/` — Angular 18, standalone components, Signals, TailwindCSS, Reactive Forms
- **Backend**: `backend/` — NestJS, TypeORM, better-sqlite3, JWT auth, Swagger (dev only)

---

## Quick Start

### Backend (port 3000)
```bash
cd backend
cp .env.example .env              # fill in JWT secrets: openssl rand -hex 32
npm ci --ignore-scripts           # NEVER use npm install
npm rebuild better-sqlite3        # native addon — explicit rebuild
npm run migration:run
npm run start:dev
# Swagger: http://localhost:3000/api/docs (disabled in production)
```

### Frontend (port 4200)
```bash
cd frontend
npm ci --ignore-scripts
npm start
```

---

## Commands

| Command | Description |
|---------|-------------|
| `cd backend && npm test` | Jest unit tests |
| `cd frontend && npm test` | Jasmine/Karma unit tests |
| `cd frontend && npm run e2e` | Playwright E2E |
| `cd backend && npm run migration:run` | Apply DB migrations |
| `cd backend && npm run migration:generate` | Generate new migration from entity diff |
| `cd backend && npm audit --audit-level=high` | Security audit |
| `cd frontend && npm audit --audit-level=high` | Security audit |

---

## Security Architecture

### Supply Chain (npm)
- **Exact versions** in both `package.json` — no `^` or `~`
- **`.npmrc`** in each package: `ignore-scripts=true` + `save-exact=true`
- **`npm ci --ignore-scripts`** always — never `npm install`
- **`package-lock.json` committed** — lockfile is the source of truth
- **Dependabot** weekly: backend, frontend, GitHub Actions (`/.github/dependabot.yml`)
- **`npm audit --audit-level=high`** in every CI run

### Backend (NestJS)
- **Helmet** — CSP, HSTS (prod only), X-Frame-Options DENY, Referrer-Policy, X-Content-Type-Options
- **ThrottlerModule** — global 100 req/60s; `/auth/login` 10/60s; `/auth/register` 5/60s
- **ValidationPipe** — `whitelist: true` + `forbidNonWhitelisted: true` — unknown fields rejected
- **GlobalExceptionFilter** — strips stack traces and DB messages before sending to client
- **Swagger off in production** (`NODE_ENV=production`)
- **Binds to 127.0.0.1** — not exposed to all interfaces; use a reverse proxy in prod

### Auth
- `bcryptjs` (pure JS) — 10 salt rounds
- Access token: 15 min · Refresh token: 7 days, hashed in DB
- Refresh token invalidated on logout

### Frontend (Angular)
- **CSP `<meta>`** — `default-src 'self'`; restricts scripts, connections, frames
- **X-Frame-Options: DENY** — anti-clickjacking
- **X-Content-Type-Options: nosniff**
- **Permissions-Policy** — camera, mic, geolocation, payment all disabled
- Angular's built-in template sanitization covers XSS
- Auth interceptor: attaches Bearer token + auto-refresh on 401

---

## TypeScript Notes

Both apps use `"strict": true` only — individual flags (`strictNullChecks`, `noImplicitAny`, etc.) are NOT repeated (they're already included in `strict`).

| App | File | Key settings |
|-----|------|-------------|
| Backend | `tsconfig.json` | `target: ES2021`, `module: commonjs`, `moduleResolution: node` |
| Frontend | `tsconfig.json` | `target: ES2022`, `module: ES2022`, `moduleResolution: bundler`, `lib: [ES2022, dom, dom.iterable]` |

`tsconfig.build.json` (backend) extends the base and excludes `*.spec.ts` files from the production build.

---

## Windows-specific fixes
- `sqlite3` → `better-sqlite3` (no VS Build Tools needed; prebuilt binary downloads via `npm rebuild`)
- `bcrypt` → `bcryptjs` (pure JS — no native compilation)
- `@nestjs/config` was missing from original deps; installed separately

---

## API Endpoints
```
POST   /auth/register    ← 5/60s per IP
POST   /auth/login       ← 10/60s per IP
POST   /auth/refresh
POST   /auth/logout
GET    /tasks?page=1&limit=10&status=todo&priority=high
POST   /tasks
GET    /tasks/:id
PATCH  /tasks/:id
DELETE /tasks/:id
GET    /stats
```

---

## Environment Variables
```
NODE_ENV=development
PORT=3000
DB_PATH=./tasks.db
JWT_ACCESS_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32 — different from above>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:4200
```

---

## CI/CD
- **GitHub Actions** (`.github/workflows/ci.yml`): `npm ci --ignore-scripts` → rebuild native addons → lint → test → `npm audit`
- **Dependabot** (`.github/dependabot.yml`): weekly PRs grouped by ecosystem (NestJS, Angular, Actions)
