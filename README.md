# FitSewa: Move Better. Live Healthier.

Nepal-focused fitness, nutrition and wellness platform. **Stage 1: website and web application.**
Mobile (React Native + Expo) starts only after the website is approved.

## Structure
- `apps/web` Next.js (App Router, TypeScript, Tailwind)
- `apps/api` Express REST API (`/api/v1`), TypeScript, Zod, Mongoose
- `packages/shared` Zod schemas, types and constants shared by web (and later mobile)
- `docs/` decisions log, setup and deployment notes

## Run (GitHub Codespaces or local, Node 22)
```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @fitsewa/shared build
pnpm dev            # web :3000, api :4000
pnpm typecheck && pnpm test && pnpm build
```

## Status
See `docs/PROGRESS.md`.
