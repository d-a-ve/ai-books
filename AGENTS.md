# AGENTS.md

## Cursor Cloud specific instructions

### What this is
`ai-books` is a single-service **React Router v7** app (SSR/full-stack mode) — a "Digital Library" that browses books/magazines/newspapers and has a password-protected admin CMS at `/admin`. There is **no database**: all content lives in in-memory mock data (`app/lib/api/mock-data.ts`), so any created/edited/deleted content resets whenever the dev/prod server restarts. File uploads are mocked (`app/lib/api/upload.server.ts`).

### Package manager
Use **pnpm** (the repo ships `pnpm-lock.yaml`). Ignore the `npm install` / `npm ci` mentions in `README.md` and `Dockerfile` — there is no `package-lock.json`, so the Dockerfile build is inconsistent with the repo and npm should not be used for local dev.

### Commands (see `package.json` scripts)
- Dev server: `pnpm run dev` → http://localhost:5173 (HMR).
- Typecheck (there is **no separate lint script** — this is the check): `pnpm run typecheck`.
- Production build: `pnpm run build`; serve the build with `pnpm run start` → port 3000.

### Gotchas
- `pnpm install` prints a warning about ignored build scripts (`@tailwindcss/oxide`, `esbuild`). This is expected and harmless — the app builds and runs correctly without approving them, so do **not** add an interactive `pnpm approve-builds` step.
- Admin login is at `/admin/login`. The password comes from `ADMIN_PASSWORD` (defaults to `admin123` when unset); `SESSION_SECRET` also has a dev default. No `.env` is required to run.
