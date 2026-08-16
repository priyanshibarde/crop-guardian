# Crop Guardian

Crop Guardian currently contains the existing React frontend and a minimal Express API foundation. The backend is intentionally limited to infrastructure and a health check; authentication, persistence, uploads, diagnosis, and recommendations are not connected yet.

## Local development

### Frontend

From the project root:

```bash
npm install
npm run dev
```

The Vite frontend runs at `http://localhost:5173` by default. Copy `.env.example` to `.env` only if you need to override the API base URL.

### Backend

From the `server` directory:

```bash
npm install
copy .env.example .env
npm run db:migrate
npm run dev
```

Before running the migration, configure PostgreSQL and set `DATABASE_URL` in `server/.env`. For a local PostgreSQL installation, create a database and application user with your own credentials, then use a connection string such as:

```text
DATABASE_URL=postgresql://crop_guardian_app:your-local-secret@localhost:5432/crop_guardian
```

The migration creates the initial users, profiles, preferences, crops, pets, and authentication-session tables. Do not commit `.env` or real credentials.

The Express API runs at `http://localhost:4000` by default. Verify the foundation with:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{"status":"ok"}
```

For a production-style local start after building:

```bash
npm run build
npm run start
```

The frontend API abstraction is available at `src/api/client.ts`, but no existing page is connected to it yet. Existing localStorage and demo diagnosis behavior remain unchanged. See `server/README.md` for the full backend setup and endpoint list.

## Existing Vite template notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
