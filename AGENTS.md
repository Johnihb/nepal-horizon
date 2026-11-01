# AGENTS.md

Two independent npm projects, **no root `package.json` and no workspace**. Run `npm install` inside `backend/` and `frontend/` separately.

- `backend/` — Express 5 + TypeScript (tsx, no build step), Prisma 7, Better Auth, Cloudinary. Port **5000**.
- `frontend/` — Next.js 16 (App Router) + React 19 + Turbopack, Tailwind 4, shadcn on **Base UI**. Port **3000**.

## Commands

```bash
# backend (cd backend)
npm run dev                    # nodemon + tsx server.ts on :5000
npx tsc --noEmit               # the only "build"/typecheck; tsconfig has noEmit
npx prisma generate            # REQUIRED after install and after any schema edit
npx prisma migrate dev         # migrations live in prisma/migrations
npx tsx daas.ts                # gitignored scratch analytics script (raw SQL)

# frontend (cd frontend)
npm run dev                    # next dev (Turbopack) on :3000
npm run lint                   # eslint (eslint-config-next); run before finishing
npx tsc --noEmit
npx shadcn@latest add <name>   # components.json style is "base-vega"
```

There are **no tests in either project** (`backend`'s `test` script intentionally exits 1). Verify changes with `tsc --noEmit` + a manual request.

## Backend rules that will break your build

- **Every relative import must carry the `.ts` extension** (`import { prisma } from "../lib/prisma.ts"`). Required by `allowImportingTsExtensions`.
- `verbatimModuleSyntax` is on: type-only imports need `import type { X }`.
- `strict` **plus** `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are on here (frontend does not set these). Array/index access yields `T | undefined`.
- **Prisma client output is `backend/generated/prisma` and is gitignored.** The generator is `prisma-client` (not `prisma-client-js`), so it emits TS that you import directly. Nothing resolves until `npx prisma generate` has run.
- The datasource URL lives in `prisma.config.ts` (`process.env.DATABASE_URL`), **not** in `schema.prisma` — `datasource db { provider = "postgresql" }` has no `url` field. Postgres is reached through `@prisma/adapter-pg` (`lib/prisma.ts`).
- Better Auth is mounted as `app.all("/api/auth/*splat", toNodeHandler(auth))` **before** `express.json()`. The `*splat` syntax is Express 5; do not "fix" it to `*`, and do not move body parsers above it.
- Auth flow: `requireAuth` (`middleware/auth.middleware.ts`) calls `auth.api.getSession` and assigns `req.session`, typed globally in `types/express.d.ts`. Handlers read `req.session?.user.id`.
- **Gotcha:** `/api/v1/admin` routes are only `requireAuth`-gated — nothing checks `role === "ADMIN"` server-side. The role **is** exposed to the client: `lib/auth.ts` declares `user.additionalFields.role` (`type: "string"`, `input: false`, default `"USER"`), so `GET /api/auth/get-session` and the sign-in response both carry `user.role`. The frontend gates `/admin` on `session.user.role === "ADMIN"` (`hooks/session.ts`). Adding a role field to the session does not add a role check to the routes.
- Images are mounted at `"/api/v1/images"` in `server.ts`; the browser calls `GET /api/v1/images/` for the signature and `DELETE /api/v1/images/:id` (the Cloudinary `public_id`, `/` URL-encoded) to remove one.
- Respond through the `apiResponse(statusCode, data, message?)` helper from `helpers/apiResponse.ts` — it returns `{ statusCode, body, message }` and the controller passes an explicit `res.status(...)` separately. Some older handlers return raw objects instead; prefer the helper for new code.
- Cloudinary: the server **never receives file bytes**. `imageSignedUrl` returns a signature the browser uses to POST directly to Cloudinary. The `asset_folder` value must stay `"e-tourism"` on both the signing side and the `formData.append("asset_folder", ...)` side, or every upload 400s.
- Zod schemas for request bodies/params live in `types/package.ts` (`packageSchema`, `validatePackageId`, `validatePackageRequest`), not next to the controllers.
- Backend package pagination is hardcoded: `take: 5`, and the `?offset=` query is a **page index**, not a row offset.
- **Broken endpoint:** `DELETE /api/v1/user/package/:packageId` always answers 400. The working delete is `DELETE /api/v1/admin/:id` (which also destroys the journey's Cloudinary assets). The frontend only ever calls the admin one.
- `prisma.config.ts` throws at load if `DATABASE_URL` is unset, so `npx prisma migrate dev` fails loudly instead of writing `url: undefined` into the config type.

## Frontend notes

- `next.config.ts` enables `reactCompiler: true` and pins `turbopack.root` to the app dir.
- `components/ui/*` is built on `@base-ui/react`, **not Radix**. Props differ from the Radix-based shadcn components in your training data (`Dialog.Trigger.Props`, not `DialogTriggerProps`). Read the local file before using one.
- No env vars anywhere: `lib/axios.ts` hardcodes `http://localhost:5000/api/v1` and `lib/auth-client.ts` hardcodes `http://localhost:5000`. Backend CORS and Better Auth `trustedOrigins` both only allow `http://localhost:3000` — changing ports requires editing all four.
- `app/dashboard/page.tsx` is the **field office ledger** — it is wired to `/api/v1/bookingAnalytics/{days|weeks|months}` through `hooks/get.ts` (`useBookingAnalytics`) and Recharts. The range lives in the URL as `?range=`.
- `/` (home) is the Nepal Horizon landing route (Three.js/GSAP) — `app/page.tsx` renders `components/nepal-horizon.tsx`. The old scratch pages `/demo`, `/demo3d`, `/nepal`, `/test`, `/test-trail` were deleted along with their orphaned components and public assets.
- TanStack Query provider is mounted in the root layout; data hooks live in `hooks/get.ts` and `hooks/post.ts` and are all `"use client"`. Use them instead of ad-hoc `useEffect` fetching.
- `frontend/AGENTS.md` carries a Next.js warning: this Next version has breaking changes. Read `node_modules/next/dist/docs/` before relying on memory for routing/params/caching APIs.

## Frontend structure (as built)

Routes (App Router, all under `frontend/app/`):

| Route | File | What it is |
|---|---|---|
| `/` | `app/page.tsx` | Nepal Horizon landing (Three.js + GSAP) — the untouched design reference |
| `/packages` | `app/packages/home.tsx` | The journey ledger, 5 per page (`?page=` is a page index) |
| `/package/[id]` | `app/package/[id]/package.tsx` | One journey, with the plate/photograph hero |
| `/package/booking/[id]` | `app/package/booking/[id]/booking.tsx` | Booking form (travel date + party size) |
| `/bookings` | `app/bookings/bookings.tsx` | The traveller's own reservations |
| `/login`, `/signup` | `app/(auth)/**` | Auth screens |
| `/dashboard` | `app/dashboard/page.tsx` | Field office: booking/revenue/traveller analytics |
| `/admin` | `app/(admin)/admin/admin.tsx` | The console: list, create, edit, delete journeys + upload (`?page=` is a page index) |
| `/upload` | `app/(admin)/upload/page.tsx` | Redirects to `/admin`; the old scratch uploader is gone |

- **Design contract:** `frontend/DESIGN_SYSTEM.md`. The kit itself is `app/globals.css` — an `@layer components` block of `.nh-page*` atoms on top of the landing route's ink/paper `.nh-*` tokens. The page shell is `<SiteShell tone="ink|paper">` in `components/site/shell.tsx`; the shared blocks are `components/site/{hero,states,journey-plate,journey-row}.tsx`.
- **API layer:** every call goes through `frontend/lib/api.ts` (typed wrappers + `toApiError`, which flattens the four different error envelopes the backend uses into one `ApiError`). Never call `axios` directly from a component.
- **Colour rule:** on the ink shell the data colours are `--nh-accent` `#6FC6CE` (bookings), `--nh-accent-2` `#E7A25A` (revenue), `--nh-mist` `#BDBDBD` (travellers). The paper-shell accents `#1A6B72`/`#9C5311` fail 3:1 against black and must never cross over. See `DESIGN_SYSTEM.md` §1.
- **Motion:** scroll-reveal and the Three.js scene belong to the landing route only. App pages are static.
- **Missing media:** a journey with no photograph renders the contour-SVG "plate" (`components/site/journey-plate.tsx`), never a stock photo from the wrong continent.
- **Dates in forms:** use `useSyncExternalStore` for "today" (server snapshot `""`), not `useEffect` + `setState`.
- **Locales:** dates are `en-GB` (`lib/format.ts` `formatDate`, `components/dashboard/chart-config.ts`), money and counts are `en-US`. Keep it that way so a date never reads in one style and a price in another.
- **Pagination is URL-driven:** both ledgers (`/packages`, `/admin`) read `?page=` (a page index) and render `<Link>` controls, not `<button onClick>`. A client component that reads `useSearchParams` must sit under a `<Suspense>` boundary.
- **Nav mirrors access:** the header shows the Console link only to `session.user.role === "ADMIN"`, and the field-office/console links hide below 720px (`nh-nav-hide`).
- The only `<img>` tags in the app are Cloudinary URLs — `next/image` would need a remote loader for them. `@next/next/no-img-element` warnings on those lines are expected.

## Graphify knowledge graph (optional shortcut)

`graphify-out/graph.json` — 1184 nodes / 1644 edges / 177 communities, built from commit `10a21d51` on 2026-08-31 (AST extraction, no API cost). ~150 notes in `graphify-out/obsidian/`.

```
/graphify query "how does deleteImage work?"
/graphify explain "postPackage"
/graphify path "AuthModule" "Database"
/graphify update .        # re-run after code changes; compare `git rev-parse HEAD` to built_at_commit
```

Skip it for runtime debugging, builds, and tests — the graph goes stale as soon as you edit code. The directory is untracked, so it is local-only.

## Other local tooling

- `.opencode/settings.json` has a `PreToolUse` Bash hook that appends every shell command to `Terminal.md.log`.
- OpenCode is running as Desktop **2.0.19**. The desktop app bundles the CLI at `%APPDATA%\ai.opencode.desktop\cli\2.0.19\opencode-cli.exe` but does **not** put it on PATH — `%APPDATA%\npm\opencode.cmd` is a shim added for this repo so `opencode ...` works from any shell.
- Hot reload is automatic via file watchers on `.opencode/`, `.opencode/skills/`, `.agents/skills/`, `.claude/skills/` — saving a file is enough. Force it with `opencode reload` (prints `Configuration reloaded`); `opencode service restart` is the heavier hammer when the background server is wedged.

## Skills

`.opencode/skills/` is the single source of truth. `.agents/skills/*` and `.claude/skills/*` are Windows **junctions** into it, so edit only `.opencode/skills/` — the other two update automatically. Verified propagation; do not "restore" them as real folders.

`.opencode/commands/<name>.md` is what makes `/<name>` work. **Skills and slash commands are separate registries.** A skill is loaded by the model through the `skill` tool using its ID; typing `/<name>` does not reliably reach it, and the `slash: true` frontmatter field is not the fix (its only documented effect is *hiding* via `slash: false`). Each command file here is a thin wrapper whose template tells the agent to load the matching skill. **When adding a skill, add both files.** Command files hot-reload on save; skill frontmatter is only re-read on a rescan.

Frontmatter is optional at runtime, so a skill with no `description` loads but is never advertised to the model. The skill **ID is the path**, not the frontmatter `name` — `.opencode/skills/ponytail/SKILL.md` is ID `ponytail`. Verify discovery in `%USERPROFILE%\.local\share\opencode\log\opencode.log` by searching for `skills rescanned` / `command.updated`.
