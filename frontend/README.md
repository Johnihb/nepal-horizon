# Frontend — Nepal Horizon (e-tourism)

Next.js 16 (App Router) frontend for the Nepal Horizon tourism platform. See the root [`README.md`](../README.md) for the full project overview.

## Quick start

```bash
npm install
npm run dev            # http://localhost:3000
```

## Scripts

- `npm run dev` — Next dev (Turbopack) on `:3000`
- `npm run lint` — eslint
- `npm run build` / `npm run start`
- `npx tsc --noEmit` — typecheck

## Notes

- No env vars: `lib/axios.ts` hardcodes `http://localhost:5000/api/v1` and `lib/auth-client.ts` hardcodes `http://localhost:5000`.
- Design contract: see `DESIGN_SYSTEM.md`.
- Next.js 16 has breaking changes vs. training data — consult `node_modules/next/dist/docs/` before relying on memory for routing/params/caching APIs.