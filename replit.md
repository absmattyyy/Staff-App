# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Alte Zimmerei Staff App (Expo Mobile)

Internal employee mobile app for "Alte Zimmerei" venue.

**Tech**: Expo SDK 54, React Native, Expo Router (file-based), Inter fonts

**Features**:
- Dark mode, amber (#E89F3F) accent color
- Bottom tab nav with elevated center "Zeit" (Zeiterfassung) button
- Feed screen: news/general posts with pinned, important badges, reactions, comments
- Dienstplan screen: monthly calendar picker + shift cards with status badges
- Zeiterfassung screen: live clock, check-in/out, break management, monthly stats, booking history
- Tausch screen: shift swap requests (own + open), take-over action
- Mehr screen: profile card, menu groups, logout

**Structure**:
- `app/(tabs)/` — 5 tab screens (feed, dienstplan, zeiterfassung, tausch, mehr)
- `components/` — ui/, feed/, dienstplan/, zeiterfassung/, tausch/ sub-folders
- `context/AppContext.tsx` — shared check-in/out state and user
- `data/` — mock data for all features
- `types/index.ts` — shared TypeScript types
- `constants/colors.ts` — dark mode design tokens
- `hooks/useColors.ts` — returns dark color palette

**Mock Data**: All data is local (no backend), structured for easy API migration later.
