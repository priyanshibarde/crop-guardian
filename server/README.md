# Crop Guardian API

Phase 2 adds PostgreSQL-backed account, profile, crop, and pet foundations. The API uses bearer sessions backed by the `auth_sessions` table. No diagnosis, image upload, pesticide recommendation, or frontend API integration is included yet.

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
DATABASE_URL=postgresql://crop_guardian_app:use-a-local-secret@localhost:5432/crop_guardian
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
- `GET/PATCH /api/me/profile`
- `GET/POST /api/me/crops`
- `PATCH/DELETE /api/me/crops/:id`
- `GET/POST /api/me/pets`
- `PATCH/DELETE /api/me/pets/:id`

The frontend still uses localStorage and demo diagnosis data. These APIs are not connected to existing pages yet.
