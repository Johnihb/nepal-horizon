# Nepal Horizon (e-tourism)

A full-stack tourism platform for Nepal journeys: browse and book trekking/adventure packages, upload journey imagery to Cloudinary, and run a field-office analytics ledger. Two independent npm projects — an Express 5 + Prisma backend and a Next.js 16 frontend — with no root `package.json` and no workspace.

## Repository layout

```
e/
├── backend/          # Express 5 + TypeScript (tsx), Prisma 7, Better Auth, Cloudinary (port 5000)
├── frontend/         # Next.js 16 (App Router) + React 19 + Tailwind 4 (port 3000)
├── AGENTS.md         # Build rules, route map, design contract (read first)
├── CLAUDE.md         # Knowledge-graph notes
└── README.md         # this file
```

## Tech stack

**Backend (`backend/`)**
- Express 5, TypeScript (run via `tsx`, no build step), `nodemon`
- Prisma 7 with `prisma-client` generator → output `backend/generated/prisma` (gitignored)
- PostgreSQL via `@prisma/adapter-pg` (Neon in dev)
- Better Auth (email/password, GitHub & Google OAuth, email verification, password reset via Resend)
- Cloudinary (signed browser-direct uploads)
- Zod 4 for request validation, `express-rate-limit`, `morgan`, `cors`

**Frontend (`frontend/`)**
- Next.js 16 (App Router, Turbopack), React 19, React Compiler
- Tailwind CSS 4, shadcn on `@base-ui/react`
- TanStack Query 5, axios, Recharts, Three.js + GSAP (landing route only)
- Better Auth client

## Prerequisites

- Node.js (LTS) and npm
- A PostgreSQL database (Neon or local)
- Cloudinary account
- (Optional) GitHub & Google OAuth apps, Resend API key

## Getting started

Two independent installs — run each in its own directory.

### 1. Backend

```bash
cd backend
npm install            # postinstall runs `prisma generate`
cp .env.example .env   # then fill in the values (see Environment variables)
npx prisma migrate dev # apply migrations
npm run dev            # http://localhost:5000
```

Typecheck: `npx tsc --noEmit`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

Lint: `npm run lint`. Typecheck: `npx tsc --noEmit`.

> Ports are coupled: backend CORS and Better Auth `trustedOrigins` allow only `http://localhost:3000`, and the frontend hardcodes `http://localhost:5000`. Keep both defaults unless you edit all four spots.

## Environment variables (backend)

Required (server exits on startup if any is missing):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `BETTER_AUTH_SECRET` | Better Auth session secret |
| `BETTER_AUTH_URL` | Base URL of the backend (e.g. `http://localhost:5000`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |

Optional:

| Variable | Purpose |
|---|---|
| `PORT` | Backend port (default `5000`) |
| `NODE_ENV` | `development` enables morgan logging |
| `FRONTEND_ORIGIN` | Comma-separated allowed origins (default `http://localhost:3000`) |
| `RESEND_API_KEY` | Email verification & password reset (warns if missing) |

The frontend has **no** env vars — endpoints are hardcoded in `frontend/lib/axios.ts` and `frontend/lib/auth-client.ts`.

## Data model

Core entities (see `backend/prisma/schema.prisma`):

- `User` — auth identity with `role` (`USER` | `ADMIN`), owns packages and bookings.
- `Package` — a journey: name, location, description, price, trek metadata (durationDays, maxAltitude, difficulty, bestSeason, groupSize), media.
- `Media` — Cloudinary asset (`url`, `public_id`) attached to a package.
- `Booking` — reservation: price, totalPeople, travelDate (date-only), status (`PENDING` | `CONFIRMED` | `CANCELLED`), links user + package.
- `Session`, `Account`, `Verification` — Better Auth tables.

## API reference

Base URL: `http://localhost:5000/api/v1`. Auth is handled by Better Auth under `/api/auth/*` (mounted before body parsers). Successful responses use the `apiResponse` envelope `{ statusCode, body, message? }`; errors use several shapes flattened by `frontend/lib/api.ts` → `toApiError`.

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/user/packages?offset=<page>` | List journeys, 5 per page (`offset` is a page index). Returns `{ packages, nextPage }`. Cached 5 min. |
| GET | `/user/package/:packageId` | Single journey with media. |

### Authenticated (USER+)

| Method | Path | Description |
|---|---|---|
| POST | `/user/package/booking/:packageId` | Book a journey (`{ people, date }`). |
| GET | `/user/bookedPackages` | Traveller's own reservations. 404 when none. |

### Admin (ADMIN role, `adminAuth` middleware)

| Method | Path | Description |
|---|---|---|
| POST | `/admin/` | Create a journey (validates images exist in Cloudinary). |
| GET | `/admin/bookings?status=` | All bookings, pending first; optional status filter. |
| PATCH | `/admin/booking/status` | Update booking status `{ id, status }`. |
| PATCH | `/admin/:id` | Update a journey. |
| DELETE | `/admin/:id` | Delete a journey and its Cloudinary assets. |

### Images (ADMIN, signed upload pipeline)

| Method | Path | Description |
|---|---|---|
| GET | `/images/` | Returns Cloudinary upload signature (`timestamp, apiKey, signature, cloudName, folder, allowedFormats`). |
| DELETE | `/images/:id` | Delete one Cloudinary asset by `public_id` (URL-encoded). |
| DELETE | `/images/package/:packageId` | Delete all images of a journey. |

### Analytics (ADMIN)

| Method | Path | Description |
|---|---|---|
| GET | `/bookingAnalytics/days` | Last 7 days (bookings, revenue, travellers). |
| GET | `/bookingAnalytics/weeks` | Last 7 weeks. |
| GET | `/bookingAnalytics/months` | Last 6 months. |

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | DB ping; 200 ok / 503 unhealthy. |

### Auth (Better Auth)

Mounted at `/api/auth/*` (note: above `/api/v1`). Sign-in, sign-up, OAuth (GitHub/Google), email verification, password reset, session (`GET /api/auth/get-session` carries `user.role`).

## Frontend routes

| Route | Description |
|---|---|
| `/` | Nepal Horizon landing (Three.js + GSAP). |
| `/packages` | Journey ledger, 5 per page (`?page=`). |
| `/package/[id]` | Single journey (plate/photograph hero). |
| `/package/booking/[id]` | Booking form (travel date + party size). |
| `/bookings` | Traveller's own reservations. |
| `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | Auth screens. |
| `/compare` | Package comparison. |
| `/dashboard` | Field office: booking/revenue/traveller analytics (`?range=`). |
| `/admin` | Console: list/create/edit/delete journeys + upload (`?page=`). |
| `/admin/bookings` | Admin booking queue. |
| `/upload` | Redirects to `/admin`. |

## Image upload flow

The server never receives file bytes. Flow:

1. Admin requests `GET /images/` → receives a signed payload.
2. Browser POSTs the file directly to Cloudinary using the signature, `asset_folder = "e-tourism"`.
3. The returned `{ url, public_id }` is stored in the package's `images` array on create/update.

`asset_folder` must stay `"e-tourism"` on both sides or uploads 400.

## Auth & roles

- `requireAuth` (`backend/middleware/auth.middleware.ts`) gates `/api/v1/user` booking endpoints and admin booking routes.
- `adminAuth` (`backend/middleware/adminAuth.middeware.ts`) gates `/api/v1/admin`, `/api/v1/images`, `/api/v1/bookingAnalytics` and checks `session.user.role === "ADMIN"`.
- Role is exposed to the client via `user.additionalFields.role`, so `GET /api/auth/get-session` and sign-in carry `user.role`. The frontend gates `/admin` on `session.user.role === "ADMIN"` (`frontend/hooks/session.ts`).
- Note: `/api/v1/admin` routes are `requireAuth`-gated only at the router mount via `adminAuth`; there is no separate role check beyond that middleware.

## Pagination

Backend pages 5 at a time; `?offset=` is a **page index**, not a row offset. `nextPage` is the next page index or `null`. Both `/packages` and `/admin` ledgers are URL-driven (`?page=`) with `<Link>` controls.

## Design contract (frontend)

See `frontend/DESIGN_SYSTEM.md`. Key rules:

- Page shell is `<SiteShell tone="ink|paper">` (`frontend/components/site/shell.tsx`).
- On ink shell, data colours: `--nh-accent` `#6FC6CE` (bookings), `--nh-accent-2` `#E7A25A` (revenue), `--nh-mist` `#BDBDBD` (travellers). Paper-shell accents must never cross over.
- Missing media renders the contour-SVG plate (`components/site/journey-plate.tsx`), never a stock photo.
- Dates `en-GB`, money/counts `en-US` (`frontend/lib/format.ts`).
- App pages are static (no scroll-reveal/Three.js outside landing).

## Known quirks

- `DELETE /api/v1/user/package/:packageId` always answers 400 — it is not wired. Use `DELETE /api/v1/admin/:id` (which also destroys Cloudinary assets).
- Backend package pagination is hardcoded to `take: 5`.
- Prisma client is generated into `backend/generated/prisma` (gitignored); run `npx prisma generate` after install or schema edits. The datasource URL lives in `prisma.config.ts`, not `schema.prisma`.
- Better Auth is mounted as `app.all("/api/auth/*splat", toNodeHandler(auth))` **before** `express.json()` — do not reorder or change `*splat`.
- Relative backend imports require the `.ts` extension (`allowImportingTsExtensions`).

## Scripts

Backend (`cd backend`):
- `npm run dev` — nodemon + tsx on `:5000`
- `npx tsc --noEmit` — typecheck
- `npx prisma generate` / `npx prisma migrate dev`

Frontend (`cd frontend`):
- `npm run dev` — Next dev (Turbopack) on `:3000`
- `npm run lint` — eslint
- `npm run build` / `npm run start`

## License

ISC (backend `package.json`). No root license file.