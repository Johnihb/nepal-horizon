# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Commands

```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Production build (type-check + bundle)
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Project Architecture

Next.js 16.2.9 + React 19.2.4 + TypeScript 5 project. App router structure.

### Core Stack
- **3D & Animation**: Three.js + GSAP + ScrollTrigger for immersive Nepal tourism experiences
- **UI**: shadcn/ui + TailwindCSS v4 + Radix UI primitives
- **Data**: React Query + Axios + Zod validation
- **Auth**: better-auth with session handling
- **Styling**: TailwindCSS with custom design tokens

### Directory Structure

```
app/
├── (admin)/              # Admin routes (protected)
├── (auth)/               # Auth routes (login, signup)
├── dashboard/            # User dashboard
├── package/              # Package details & booking flow
│   ├── [id]/             # Dynamic package pages
│   └── booking/[id]/     # Booking flow
├── page.tsx              # Home — renders the Nepal Horizon landing page
├── layout.tsx            # Root layout with providers
└── globals.css           # Tailwind + custom animations

components/
├── ui/                   # shadcn/ui components (50+ components)
├── nepal-horizon.tsx     # Nepal Horizon landing page
├── nepal-horizon-scene.tsx  # Three.js mountain scene + GSAP
├── dashboard/            # Recharts dashboard widgets
└── theme-provider.tsx    # next-themes wrapper

lib/
├── auth-client.ts        # better-auth client setup
├── axios.ts              # Axios instance with interceptors
└── tanstack/             # React Query setup

hooks/                    # Custom hooks (use-mobile, get/post utils)
types/                    # TypeScript type definitions
```

### Key Patterns

**Three.js Scenes**: Components in `components/*-scene.tsx` use raw Three.js (not React Three Fiber) for maximum control. All are client components with `'use client'`.

**GSAP Integration**: ScrollTrigger animations tied to canvas elements. Always register plugin at module level. Cleanup requires killing GSAP tweens and removing listeners.

**Package Routes**: Dynamic routes use `[id]` params. Booking flow is separate from package detail.

**Providers**: Wrap with `<Providers>` in layout for React Query + Theme context.

### Breaking Changes Warning

Next.js 16 has breaking changes from prior versions. Read docs at `node_modules/next/dist/docs/` before writing code. Key differences:
- `unstable_instant` for instant navigation
- Different API signatures

### 3D Scene Development

When creating Nepal tourism scenes:
- Use procedural geometry for terrain (heightmaps, particle systems)
- Implement atmospheric effects (fog, mist, stars)
- Add scroll-driven camera movements with GSAP
- Keep performance targets: 60fps desktop, 30fps mobile
- Use `THREE.Vector3.set(x, y, z)` not spread operators
- Initialize `useRef<T>()` as `useRef<T | null>(null)` for React 19 compatibility

## Code Conventions

- Client components: `'use client'` directive at top
- Styling: Tailwind classes + custom utilities in globals.css
- State: React Query for server state, useState for local
- Validation: Zod schemas in types/ directory
- No test files in frontend (no test runner configured)

## Auth Flow

Session-based auth via better-auth. Check session in server components with:
```typescript
const response = await authClient.getSession({
  fetchOptions: { headers: await headers() },
});
const session = response?.data?.user;
```

## Dependencies

Key packages: three, gsap, @tanstack/react-query, zod, better-auth, shadcn, lucide-react, recharts.

Missing optional deps that may need installing: @shadcn/react, next-themes, react-day-picker, embla-carousel-react, cmdk.
