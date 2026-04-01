## Expertify — What was done

### UI / Frontend behavior
- **Scroll-to-top on navigation**: fixed the issue where clicking **Book Session** (Find Mentors flow) opened the next page at the previous scroll position.
  - Implemented a route-change scroll reset in `code/apps/web/src/App.tsx` using `useLocation()` + `window.scrollTo(...)`.

### Frontend deployment (Vercel)
- **SPA routing on Vercel**: added `code/apps/web/vercel.json` with a rewrite to `index.html` so React Router routes like `/guides/:id/book` work on refresh.

### Backend deployment (Railway)
Railway deployment initially failed due to:
- Monorepo workspace dependency `@expertify/shared` not being published to npm.
- Node version mismatch (Prisma requires Node **20.19+** or **22.12+**; Railway was using 22.11).
- TypeScript strictness errors during build.

Fixes applied:
- **Workspace linking**: set API dependency to local workspace path:
  - `code/apps/api/package.json`: `@expertify/shared` → `file:../../packages/shared`
- **Pinned Node version** (to satisfy Prisma):
  - Added `code/Dockerfile` using `node:20.19.0-alpine`.
  - Updated `code/railway.toml` to use the Dockerfile builder.
- **Build correctness**:
  - `code/apps/api/package.json` build script generates Prisma client before TypeScript compile: `npx prisma generate && tsc`.
  - Fixed TS config + type errors so `apps/api` compiles in CI/container.

### Required environment variables (Railway API)
The API validates env vars at startup in `code/apps/api/src/config/env.ts`. These must be set in Railway **Variables** (at minimum):
- **DATABASE_URL**
- **JWT_ACCESS_SECRET** (>= 32 chars)
- **JWT_REFRESH_SECRET** (>= 32 chars)
- **SMTP_HOST**, **SMTP_PORT**, **SMTP_USER**, **SMTP_PASS**, **SMTP_FROM_EMAIL**
- **CORS_ORIGIN** (your deployed web URL)

Optional (only if using OAuth):
- **GOOGLE_CLIENT_ID**, **GOOGLE_CLIENT_SECRET**
- **LINKEDIN_CLIENT_ID**, **LINKEDIN_CLIENT_SECRET**, **LINKEDIN_REDIRECT_URI**

### Auto-deploy behavior
- With GitHub connected in Railway/Vercel, pushing to the connected branch triggers automatic redeploys.

