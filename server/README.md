# Crop Guardian API

The API uses bearer sessions backed by the `auth_sessions` table and provides PostgreSQL-backed profiles, user crops, scans, diagnoses, and crop intelligence. AI predictions remain unavailable until verified model assets are configured. Informational crop guidance and the fertilizer calculator are deterministic and are not treatment advice.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Configure PostgreSQL

Create a local PostgreSQL database and user using your own credentials. For example, from `psql` as an administrator:

```sql
CREATE USER crop_guardian_app WITH PASSWORD 'use-a-local-secret';
CREATE DATABASE crop_guardian OWNER crop_guardian_app;
```

Do not commit the password. Copy the environment template and set a private connection string:

```powershell
copy .env.example .env
```

Set `DATABASE_URL` in `.env`, for example:

```text
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/crop_guardian
```

Also review:

- `PORT` — defaults to `4000`
- `CLIENT_ORIGINS` — defaults to the local Vite origins
- `SESSION_TTL_DAYS` — defaults to `30`

## Install, migrate, and run

```powershell
npm install
npm run db:migrate
npm run dev
```

The migration command creates the `schema_migrations` table and applies ordered SQL files from `src/db/migrations`. It is safe to rerun; already recorded migration files are skipped.

For a compiled start:

```powershell
npm run build
npm run start
```

## API foundation

Public:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`

Bearer-authenticated:

- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `GET /api/user-crops`
- `POST /api/user-crops`
- `GET /api/user-crops/:id`
- `GET /api/user-crops/:id/diagnoses`
- `GET /api/user-crops/:id/timeline`
- `PUT/DELETE /api/user-crops/:id`
- `GET /api/me/profile` and `PATCH /api/me/profile` (compatibility)
- `GET/POST /api/me/crops` and `PATCH/DELETE /api/me/crops/:id` (compatibility)
- `GET/POST /api/me/pets`
- `PATCH/DELETE /api/me/pets/:id`

Scan uploads may include an optional `userCropId` in addition to the catalog
`cropId`. This links a scan to the authenticated user's specific crop while
preserving the existing catalog relationship. Crop detail, diagnosis, and
timeline queries are ownership-scoped and do not expose storage paths.

Public catalog:

- `GET /api/crops`
- `GET /api/crops/:id`

The frontend keeps localStorage demo diagnoses and mock alerts for compatibility.
Real uploaded scans use the authenticated scan/diagnosis APIs. A future
recommendation provider can consume a completed diagnosis, crop, stage, and
verified metadata; the current deterministic layer only returns general
monitoring information for explicitly supported crops and otherwise reports
insufficient information. No schema stores duplicated diagnosis data.
