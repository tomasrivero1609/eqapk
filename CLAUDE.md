# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Event-hall management system for a catering/banquet business (Spanish-language domain).
Two independent apps in one repo:

- `backend/` — NestJS 11 REST API + Prisma 7 (PostgreSQL)
- `mobile/` — Expo / React Native (SDK 54, RN 0.81) app, the only client

There is no shared package; the contract between them is the HTTP API plus hand-mirrored
types (`mobile/src/types/index.ts` mirrors the Prisma schema). Domain terms are Spanish:
`eventos` (salón events), `entrevistas`/`visitas` (client interviews), `francos` (days off),
`platos` (dishes), `menús`, `ingresos` (payments/income), `inventario`, `demostraciones`.

## Commands

### Backend (`cd backend`)

```bash
npm run start:dev        # watch-mode dev server (http://localhost:3000, binds 0.0.0.0)
npm run build            # prisma migrate deploy + generate + nest build + db seed (prod/CI)
npm run lint             # eslint --fix
npm run format           # prettier
npm test                 # jest unit tests (*.spec.ts under src/)
npm test -- events       # run a single suite by path/name filter
npm run test:e2e         # jest with test/jest-e2e.json
npm run test:cov         # coverage

# Database (Prisma) — requires DATABASE_URL in backend/.env
npx prisma migrate dev --name <change>   # create + apply a migration in dev
npx prisma generate                       # regenerate client after schema edits
npm run db:seed                           # seed admin@eqapk.com / superadmin users
npm run db:reset                          # migrate reset --force (DESTRUCTIVE)
```

`npm run build` runs migrations and the seed against whatever `DATABASE_URL` points at —
do not run it casually against a real database.

### Mobile (`cd mobile`)

```bash
npm start                # expo start (sets EXPO_USE_METRO_REQUIRE=1 via PowerShell)
npm run android          # expo start --android
npm run ios              # expo start --ios
npm run start:dev        # expo start --dev-client (for the custom dev build)
```

The mobile scripts are PowerShell-wrapped (Windows-first). The API base URL is resolved in
`mobile/src/utils/constants.ts` from `EXPO_PUBLIC_API_URL`, falling back to a hardcoded LAN
IP (`DEFAULT_DEV_URL`) in dev. Set `EXPO_PUBLIC_API_URL` to point at your backend; a physical
device needs the machine's LAN IP, not `localhost`.

## Backend architecture

Standard NestJS feature-module layout: each domain owns `*.module.ts`, `*.controller.ts`,
`*.service.ts`, and `dto/`. `AppModule` wires every feature module plus a global
`ThrottlerGuard` (120 req/min globally; `/auth/login` tightened to 10/min via `@Throttle`).

- **Prisma access**: `PrismaService` (in `src/prisma/`) extends `PrismaClient` using the
  `@prisma/adapter-pg` driver adapter over a `pg.Pool` — not Prisma's default engine.
  Inject `PrismaService` into services for all DB work. `prisma.config.ts` + the
  `provider`-only `datasource` block mean the connection string comes from env at runtime,
  not from `schema.prisma`.
- **Auth**: JWT via `passport-jwt` (`auth/strategies/jwt.strategy.ts`), 7-day tokens.
  `JwtAuthGuard` protects controllers. Passwords hashed with `bcryptjs`.
- **Authorization is permission-based, not just role-based.** Two roles exist (`STAFF`,
  `SUPERADMIN`); `SUPERADMIN` bypasses all checks. Everyone else is gated by a
  `permissions` JSON column on `User`, shaped as `{ module: action[] }` (e.g.
  `{ eventos: ['ver','crear','editar','eliminar'], ingresos: ['ver'] }`). The canonical
  full set lives in `ALL_PERMISSIONS` — **duplicated in both `auth.service.ts` and
  `prisma/seed.ts`; keep them in sync** when adding modules/actions.
  Two enforcement styles coexist:
  - Declarative (preferred for new code): `@UseGuards(JwtAuthGuard, PermissionsGuard)` on
    the controller + `@RequirePermission('inventario', 'crear')` per route. See
    `inventory.controller.ts`.
  - Inline: `events.controller.ts` calls a local `checkPermission(user, module, action)`
    because the target permission module is chosen dynamically from `eventType`
    (`SALON→eventos`, `VISITA→entrevistas`, `FRANCO→francos` via `EVENT_TYPE_MODULE_MAP`).
- **Validation**: global `ValidationPipe` with `whitelist + forbidNonWhitelisted +
  transform`, so DTOs must declare every accepted field with `class-validator` decorators —
  unknown body fields are rejected.
- **Google Calendar**: `CalendarService` signs a service-account JWT by hand (`crypto`) and
  calls the Calendar v3 REST API directly (no googleapis SDK). It is fail-soft: disabled or
  misconfigured calendars return `null`/log warnings rather than throwing, so event CRUD
  still succeeds. Separate calendar IDs per event type (salón/visitas/franco) come from env.
- **Mail**: `MailService` uses `nodemailer`.

### Domain model notes (Prisma `schema.prisma`)

- `Event` is the central, wide entity and is overloaded: the same table backs SALÓN events,
  VISITA interviews, and FRANCO day-off blocks, discriminated by `eventType`. It carries
  pricing broken out by guest tier (`adult`/`juvenile`/`child` counts + prices), a
  `quarterlyAdjustment*` mechanism for inflation, and many nullable free-text spec fields
  (decor, menu, etc.).
- `Payment` records snapshot the price-per-dish and per-tier prices *at payment time*
  (`*AtPayment` fields) so historical receipts stay accurate after prices change. Composite
  payments share a `groupId`; `discountPercent` supports full-payment discounts. Currency is
  `ARS` or `USD` with an optional `exchangeRate`.
- `Inventory` is `InventoryItem` + append-only `InventoryMovement` (type `USO`/`REPOSICION`)
  driving the running `quantity`.

## Mobile architecture

- **Navigation** (`src/navigation/`): `AppNavigator` switches between `AuthNavigator` and
  `MainNavigator` based on auth state. Native-stack navigators; dark theme (`#0f172a`).
- **State**: auth/session in Zustand (`src/store/authStore.ts`); server data via TanStack
  React Query (`QueryClientProvider` in `App.tsx`).
- **API layer** (`src/services/`): one `ApiService` singleton (`api.ts`) wraps a configured
  axios instance. A request interceptor attaches the bearer token from
  `expo-secure-store`; a response interceptor catches `401`, clears stored creds, and emits a
  global unauthorized event (`utils/authEvents.ts`) that `authStore` subscribes to in order
  to force logout. Per-domain service files (`eventService.ts`, etc.) call `api`.
  `api.ts` also exposes `isNetworkError`/`isColdStart`/`networkErrorMessage` helpers
  (the backend may be a cold-starting free-tier host returning 502/503).
- **Permissions mirror the backend**: `authStore.hasPermission(module, action)` implements
  the same SUPERADMIN-bypass + `{module: action[]}` logic client-side to show/hide UI.
- **Styling**: NativeWind (Tailwind in RN) — `global.css`, `tailwind.config.js`,
  `nativewind-env.d.ts`. Shared primitives in `src/components/ui/`.
- Token/user persistence uses `expo-secure-store`; receipts/printing use `expo-print` +
  `expo-sharing`.

## Deployment

- **Backend → Render** (`https://eqapk.onrender.com`). Render's build command is
  `npm run build`, which is why that script chains `prisma migrate deploy && prisma generate
  && nest build && prisma db seed` — migrations and the seed run on **every deploy**. The
  seed uses `upsert`, so it re-applies the `admin@eqapk.com` / superadmin passwords on each
  deploy (idempotent, but it will overwrite manual password changes to those accounts).
  Free-tier instances cold-start, returning 502/503 for a few seconds — handled client-side
  by `isColdStart`/`networkErrorMessage` in `mobile/src/services/api.ts`.
- **Mobile → EAS Build** (`mobile/eas.json`, project id in `app.json` → `extra.eas`).
  App name "Eventos Quilmes", package/bundle `com.eventosquilmes.mobile`, `appVersionSource:
  remote`. Profiles:
  - `development` — dev-client APK, internal distribution.
  - `preview` — internal APK, injects `EXPO_PUBLIC_API_URL=https://eqapk.onrender.com`.
  - `production` — store build, `autoIncrement`, injects
    `EXPO_PUBLIC_API_URL=https://eqapk.onrender.com`.

  The hardcoded `'https://tu-api-produccion.com'` fallback in `constants.ts` is now only a
  safety net (both `preview` and `production` set the env explicitly); update it too if the
  API host ever changes.

## Conventions

- The codebase is Spanish-first: domain names, permission keys/actions
  (`ver`/`crear`/`editar`/`eliminar`), user-facing strings, and many comments are in Spanish.
  Match that when extending features; permission module/action strings must match exactly
  across backend guards, `ALL_PERMISSIONS`, and `authStore`.
- When adding a backend field that the app consumes, update three places: the Prisma schema
  (+ migration), the relevant DTO(s), and the mirrored `mobile/src/types/index.ts`.
