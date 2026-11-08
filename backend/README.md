# Backend — Nepal Horizon (e-tourism)

Express 5 + TypeScript API for the Nepal Horizon tourism platform. See the root [`README.md`](../README.md) for the full project overview.

## Quick start

```bash
npm install            # postinstall runs `prisma generate`
# create .env (see root README → Environment variables)
npx prisma migrate dev
npm run dev            # http://localhost:5000
```

## Scripts

- `npm run dev` — nodemon + tsx `server.ts` on `:5000`
- `npx tsc --noEmit` — typecheck (no emit; `tsconfig` has `noEmit: true`)
- `npx prisma generate` — required after install and schema edits
- `npx prisma migrate dev` — migrations live in `prisma/migrations`

## Notable rules

- Every relative import needs the `.ts` extension (`allowImportingTsExtensions`).
- Type-only imports need `import type { X }` (`verbatimModuleSyntax`).
- Prisma client output is `generated/prisma` (gitignored); datasource URL lives in `prisma.config.ts`.
- Better Auth is mounted as `app.all("/api/auth/*splat", toNodeHandler(auth))` **before** `express.json()`.
- Images are never uploaded to this server — `GET /images/` returns a Cloudinary signature; the browser uploads directly.

## API

See root `README.md` → API reference. Base URL `http://localhost:5000/api/v1`.