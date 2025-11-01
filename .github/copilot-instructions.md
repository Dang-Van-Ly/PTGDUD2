## Purpose
Short actionable guidance to help an AI code agent become productive in this repository.

## Big picture (what this repo is)
- Monorepo with two main parts:
  - `backend/` — TypeScript Node service scaffold (deps in `backend/package.json` include `express`, `mongoose`, `jsonwebtoken`, `ts-node-dev`). Source files live under `backend/src/` (controllers, models, routes, middleware, config).
  - `frontend/food-delivery-app` — Expo React Native app using `expo-router`. App pages are under `frontend/food-delivery-app/app/` and local mock data is in `frontend/food-delivery-app/data/mockData.ts`.

## Key files & locations to reference
- Backend scripts & deps: `backend/package.json` (no `start` script currently; dev deps include `ts-node-dev`)
- Backend entry / server: `backend/src/server.ts` (currently empty in this checkout — confirm implementation before attempting to run)
- DB config: `backend/src/config/db.ts` (present but currently empty)
- Auth and middleware: `backend/src/controllers/*`, `backend/src/middleware/authMiddleware.ts` (scaffolded filenames present)
- Frontend entry and scripts: `frontend/food-delivery-app/package.json` (`start`, `android`, `ios`, `web` using `expo start`)
- Frontend app routes: `frontend/food-delivery-app/app/` (uses file-based routing from `expo-router` — e.g. `(tabs)/home.tsx`, `account/profile.tsx`)
- Mock data and images: `frontend/food-delivery-app/data/mockData.ts` and `frontend/food-delivery-app/assets/images/` (mockData both references remote URLs and local `require()` image imports)

## Run & debug workflows (concrete, reproducible)
- Frontend (Expo):
  1. Open PowerShell, cd into `frontend/food-delivery-app`
  2. Install: `npm install` (or `yarn`/`pnpm` if you prefer)
  3. Start: `npm run start` (or `npm run android` / `npm run ios` / `npm run web`)

- Backend (dev):
  - The repo contains `ts-node-dev` in devDependencies but no `start` script. Use a dev-run command like:
    `cd backend; npm install; npx ts-node-dev --respawn --transpile-only src/server.ts`
  - Expect to create or supply environment variables (e.g., DB connection string, JWT secret). Check for a `.env` in the project or add one.
  - If `backend/src/server.ts` is empty, implement or wire the server before attempting to start.

## Conventions & patterns to follow
- Folder naming: controllers are in `backend/src/controllers/<name>Controller.ts`, models in `backend/src/models/<Model>.ts`, routes in `backend/src/routes/*Routes.ts`.
- Frontend uses `expo-router` file-based routing — adding a file `app/categoryDetail/[id].tsx` creates a dynamic route. Follow existing nested layout patterns (see `(tabs)/_layout.tsx`).
- Mock data: `data/mockData.ts` serves as a local data source for many screens; images are mixed between remote `image_url` strings and local `require()` mappings (`restaurantImages` object). When adding images, keep both forms consistent with existing usage.

## Integration points & external dependencies
- Backend expects MongoDB (Mongoose present) and likely JWT auth (jsonwebtoken listed). Confirm actual env var names in config files (currently `db.ts` and `authMiddleware.ts` are empty in this checkout).
- Frontend depends on Expo and React Native libraries; interactions with backend will typically be via REST endpoints under `backend/` routes — inspect `frontend` code where network calls are made (search for `fetch` / axios) before changing API surface.

## Editing guidance & safety
- Do not assume backend runtime details — several backend source files are empty in this checkout (server.ts, config/db.ts, controllers). Before implementing features that call backend, confirm the intended API shape with the maintainer.
- When adding routes/controllers, stick to the existing naming pattern (Controller/Routes) and keep Mongoose models under `backend/src/models`.

## Quick troubleshooting checklist
- If frontend can't load local images: ensure the `require()` paths in `data/mockData.ts` match files under `assets/images`.
- If backend won't start: verify `backend/src/server.ts` contains an Express app and server listen call; run via `npx ts-node-dev`.

## What I couldn't discover automatically (ask the maintainer)
- Exact environment variable names and expected formats for DB connection and JWT secrets.
- Whether the backend is intended to be run via Docker or hosted externally.

If any section is unclear or you want the file to include extra details (example requests, common response shapes, or a recommended `npm` scripts update for `backend/package.json`), tell me which part to expand and I'll iterate.
