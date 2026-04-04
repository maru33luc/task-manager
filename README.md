<div align="center">

# ✅ Task Manager

<p>
  <img src="https://img.shields.io/badge/Angular-18-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img src="https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-better--sqlite3-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/JWT-Auth-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
  <img src="https://img.shields.io/badge/Helmet-Hardened-4B5563?style=for-the-badge&logo=letsencrypt&logoColor=white" />
  <img src="https://img.shields.io/badge/Playwright-E2E-45ba4b?style=for-the-badge&logo=playwright&logoColor=white" />
  <img src="https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" />
</p>

<br/>

> **Full-stack monorepo** con Angular 18 en el frontend y NestJS en el backend,
> blindado con las mejores prácticas de seguridad en cada capa.

</div>

---

## ⚡ Tech Stack

<table align="center">
  <tr>
    <th>Capa</th>
    <th>Tecnología</th>
  </tr>
  <tr>
    <td>🖥️ <strong>Frontend</strong></td>
    <td>Angular 18 · Standalone Components · Signals · TailwindCSS · Reactive Forms</td>
  </tr>
  <tr>
    <td>🛠️ <strong>Backend</strong></td>
    <td>NestJS · TypeORM · better-sqlite3</td>
  </tr>
  <tr>
    <td>🔐 <strong>Auth</strong></td>
    <td>JWT — access 15m + refresh 7d · bcryptjs (10 rounds)</td>
  </tr>
  <tr>
    <td>🛡️ <strong>Seguridad</strong></td>
    <td>Helmet · ThrottlerModule · CSP · Dependabot · versiones exactas</td>
  </tr>
  <tr>
    <td>🧪 <strong>Testing</strong></td>
    <td>Jest (backend) · Jasmine/Karma (frontend) · Playwright (E2E)</td>
  </tr>
  <tr>
    <td>📖 <strong>API Docs</strong></td>
    <td>Swagger / OpenAPI en <code>/api/docs</code> — solo en desarrollo</td>
  </tr>
</table>

---

## 🔧 Requisitos previos

- **Node.js** 20+
- **npm** 10+

---

## 🚀 Setup & Ejecución

### 1 · Backend `→ http://localhost:3000`

```bash
cd backend
cp .env.example .env
# ⚠ Edita .env — genera secrets seguros:
#   openssl rand -hex 32

npm ci --ignore-scripts        # instalación exacta sin scripts postinstall
npm rebuild better-sqlite3     # rebuild nativo, controlado y explícito
npm run migration:run
npm run start:dev
```

> Swagger (solo dev): [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

### 2 · Frontend `→ http://localhost:4200`

```bash
cd frontend
npm ci --ignore-scripts
npm start
```

---

> [!TIP]
> **¿Por qué `npm ci --ignore-scripts`?**
> `npm ci` instala exactamente lo que está en el lockfile — sin drift de versiones.
> `--ignore-scripts` bloquea scripts `postinstall`, previniendo ataques de supply chain
> como el [incidente de axios (Mar 2026)](https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan).

---

## 🗂️ Estructura del Proyecto

```
task-manager/
├── .github/
│   ├── workflows/ci.yml        # CI: npm ci → audit → test
│   └── dependabot.yml          # PRs semanales de dependencias
│
├── backend/
│   ├── src/
│   │   ├── auth/               # JWT — login, register, refresh, logout
│   │   ├── users/              # Entidad User + hashing de contraseñas
│   │   ├── tasks/              # CRUD de tareas + paginación + filtros
│   │   ├── stats/              # Estadísticas agregadas por usuario
│   │   ├── entities/           # Entidades TypeORM (User, Task)
│   │   ├── common/             # Filtro de excepciones global + logging
│   │   └── migrations/         # Migraciones de base de datos
│   ├── .npmrc                  # ignore-scripts=true · save-exact=true
│   ├── .env.example
│   └── package.json            # Versiones exactas (sin ^ ni ~)
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # Login, Register · AuthService · guard · interceptor
│   │   │   ├── tasks/          # TaskList, TaskForm · TasksService
│   │   │   ├── dashboard/      # Dashboard · StatsService
│   │   │   └── core/models/    # Interfaces TypeScript
│   │   └── index.html          # CSP + X-Frame-Options + Permissions-Policy
│   ├── e2e/                    # Tests E2E con Playwright
│   ├── .npmrc                  # ignore-scripts=true · save-exact=true
│   └── package.json            # Versiones exactas
│
├── .gitignore                  # Excluye .env, *.db, node_modules
└── CLAUDE.md                   # Memoria del proyecto para asistencia IA
```

---

## 📡 API Reference

### Autenticación

| Método | Ruta | Auth | Rate Limit | Descripción |
|:------:|------|:----:|:----------:|-------------|
| `POST` | `/auth/register` | — | **5 / 60s** por IP | Registrar usuario |
| `POST` | `/auth/login` | — | **10 / 60s** por IP | Iniciar sesión |
| `POST` | `/auth/refresh` | Refresh token | — | Obtener nuevo access token |
| `POST` | `/auth/logout` | Refresh token | — | Invalidar refresh token |

### Tareas

| Método | Ruta | Auth | Rate Limit | Descripción |
|:------:|------|:----:|:----------:|-------------|
| `GET` | `/tasks` | Bearer | 100 / 60s | Listar tareas (paginado + filtros) |
| `POST` | `/tasks` | Bearer | 100 / 60s | Crear tarea |
| `GET` | `/tasks/:id` | Bearer | 100 / 60s | Obtener tarea |
| `PATCH` | `/tasks/:id` | Bearer | 100 / 60s | Actualizar tarea |
| `DELETE` | `/tasks/:id` | Bearer | 100 / 60s | Eliminar tarea |
| `GET` | `/stats` | Bearer | 100 / 60s | Estadísticas de tareas |

### Query params de `/tasks`

| Parámetro | Valores | Default |
|-----------|---------|:-------:|
| `status` | `todo` · `in-progress` · `done` | — |
| `priority` | `low` · `medium` · `high` | — |
| `page` | entero | `1` |
| `limit` | entero (máx 100) | `10` |

---

## 🛡️ Seguridad

<details>
<summary><strong>📦 Supply Chain</strong></summary>
<br/>

- Todas las versiones de dependencias **fijadas exactamente** — sin `^` ni `~`
- `.npmrc` en cada paquete: `ignore-scripts=true` bloquea scripts postinstall
- `npm ci` obligatorio en CI — falla si el lockfile difiere de `package.json`
- `npm audit --audit-level=high` en cada push de CI
- **Dependabot** envía PRs semanales para backend, frontend y GitHub Actions

</details>

<details>
<summary><strong>🌐 HTTP / Web</strong></summary>
<br/>

- **Helmet** — CSP, HSTS (prod), X-Frame-Options, Referrer-Policy, X-Content-Type-Options
- **Rate limiting** — protección contra fuerza bruta en `/auth/login` y `/auth/register`
- **ValidationPipe** — rechaza y elimina campos desconocidos en cada request
- **Exception filter** — nunca expone stack traces ni detalles de DB al cliente
- **Angular CSP** — etiquetas `<meta>` restringen scripts, conexiones e iframes
- **Swagger deshabilitado en producción** — `/api/docs` solo disponible en dev

</details>

<details>
<summary><strong>🔑 Auth</strong></summary>
<br/>

- Contraseñas hasheadas con **bcryptjs** (10 rounds)
- **Access tokens** expiran en 15 minutos
- **Refresh tokens** hasheados con bcryptjs antes de almacenarse; invalidados en logout
- Los secrets JWT deben tener ≥ 32 chars — genera con `openssl rand -hex 32`

</details>

---

## 🧪 Ejecutar Tests

```bash
# Tests unitarios — backend
cd backend && npm test

# Tests unitarios — frontend
cd frontend && npm test

# E2E (ambos servidores deben estar corriendo)
cd frontend && npm run e2e

# Auditoría de seguridad
cd backend  && npm audit --audit-level=high
cd frontend && npm audit --audit-level=high
```

---

## 🌱 Variables de Entorno

Ver `backend/.env.example`. Las críticas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `JWT_ACCESS_SECRET` | Firma access tokens — mín 32 chars | `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Firma refresh tokens — **diferente** al anterior | `openssl rand -hex 32` |
| `JWT_ACCESS_EXPIRES_IN` | Vida útil del access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Vida útil del refresh token | `7d` |
| `DB_PATH` | Ruta al archivo SQLite | `./tasks.db` |
| `CORS_ORIGIN` | URL permitida del frontend | `http://localhost:4200` |
| `NODE_ENV` | Entorno de ejecución | `development` |

---

## ⚙️ Configuración TypeScript

Ambas apps usan `"strict": true` (un solo flag activa toda la suite — sin flags redundantes individuales).

| App | Target | Module Resolution |
|-----|:------:|:-----------------:|
| Backend | ES2021 / CommonJS | `node` |
| Frontend | ES2022 | `bundler` (Angular 18) |

---

<div align="center">

Hecho con TypeScript, seguridad en mente y cero compromisos.

</div>
