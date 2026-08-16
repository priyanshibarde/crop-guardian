# Crop Guardian

Crop Guardian contains a React frontend, an Express API, PostgreSQL persistence, authenticated crop management, scan/diagnosis infrastructure, and a localhost-only inference boundary. The real model remains optional and unavailable until verified model assets are supplied.

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

The ordered migrations create users, profiles, preferences, crops, pets, authentication sessions, scans, diagnoses, and the optional scan-to-user-crop link. Do not commit `.env` or real credentials.

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

The frontend API abstraction is available at `src/api/client.ts`. Crop dashboard/detail pages use authenticated user-crop and diagnosis-history APIs; demo diagnosis behavior remains local and separate from real uploaded scans.

## Phase 7 crop intelligence

The crop experience includes user-crop detail pages, diagnosis history/status, a timeline of stored crop events, deterministic informational crop guidance, and a label-rate arithmetic calculator. It does not create health scores, fabricate diagnoses, or generate guaranteed treatments. See `server/README.md` for the Phase 7 endpoint list and `server/inference/README.md` for model limitations.

## Phase 8 onboarding and language

The first-visit flow is welcome → language → authentication → profile setup. Existing authenticated users are routed using the server profile's `onboardingCompleted` state, while localStorage is used only for cached language and UI preferences. English, Hindi, Marathi, Bengali, Gujarati, Tamil, Telugu, and Punjabi have UTF-8 translations; other registered Indian languages explicitly fall back to English until their translations are added.

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
