# Expertify

A peer-to-peer guidance marketplace connecting students and early-career professionals with people who have completed similar journeys.

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database (local or cloud)
- **Git**

### Step 1: Install Dependencies

From the project root:

```bash
npm install
```

This installs dependencies for all workspaces (web, api, shared).

### Step 2: Set Up Database

1. **Create a PostgreSQL database** (local or cloud):
   ```bash
   # Example: local PostgreSQL
   createdb expertify
   ```

2. **Configure API environment variables**:
   ```bash
   cd apps/api
   cp .env.example .env
   ```

3. **Edit `apps/api/.env`** and set your `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/expertify
   JWT_ACCESS_SECRET=your-super-secret-access-key-at-least-32-chars-long
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-chars-long
   CORS_ORIGIN=http://localhost:5173
   # ... other vars (see .env.example for full list)
   ```

4. **Generate Prisma Client and run migrations**:
   ```bash
   cd apps/api
   npm run prisma:generate
   npm run prisma:migrate
   ```

### Step 3: Build Shared Package

The shared package must be built before the API and web apps can use it:

```bash
cd packages/shared
npm run build
```

Or from root:
```bash
npm run build -- --filter @expertify/shared
```

### Step 4: Run the Application

**Option A: Run everything together (recommended)**

From the project root:

```bash
npm run dev
```

This starts both the API server and web app concurrently via Turborepo.

**Option B: Run separately**

Terminal 1 - API Server:
```bash
cd apps/api
npm run dev
```
API runs on `http://localhost:4000` (or `PORT` from `.env`)

Terminal 2 - Web App:
```bash
cd apps/web
npm run dev
```
Web app runs on `http://localhost:5173` (Vite default)

### Step 5: Access the Application

- **Frontend**: http://localhost:5173
- **API Health Check**: http://localhost:4000/api/v1/health
- **API Base**: http://localhost:4000/api/v1

## Project Structure

```
expertify/
├── apps/
│   ├── web/          # React frontend (Vite + TypeScript)
│   └── api/           # Express backend (TypeScript + Prisma)
├── packages/
│   └── shared/        # Shared Zod schemas and types
└── turbo.json         # Turborepo configuration
```

## Available Scripts

### Root Level

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps

### API (`apps/api`)

- `npm run dev` - Start API server with hot reload
- `npm run build` - Compile TypeScript to `dist/`
- `npm run start` - Run production build
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations

### Web (`apps/web`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Shared (`packages/shared`)

- `npm run build` - Compile TypeScript schemas to `dist/`

## Troubleshooting

### "Cannot find module '@expertify/shared'"

Build the shared package first:
```bash
cd packages/shared && npm run build
```

### "Prisma Client not found"

Generate Prisma Client:
```bash
cd apps/api && npm run prisma:generate
```

### "Database connection error"

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` in `apps/api/.env`
3. Ensure the database exists: `createdb expertify`

### Port already in use

- API: Change `PORT` in `apps/api/.env`
- Web: Change port in `apps/web/vite.config.ts` or use `--port` flag

## Next Steps

- Create your first user via `/auth/signup`
- Set up a guide profile (requires email verification)
- Explore the guides directory at `/guides`

## Development Notes

- The API uses **JWT tokens** (access token in response, refresh token in HTTP-only cookie)
- Frontend uses **React Query** for server state management
- All validation schemas are shared via `@expertify/shared` package
- Database migrations are managed via Prisma
