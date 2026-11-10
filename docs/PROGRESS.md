# Progress checklist

## M1 Project setup
- [x] Monorepo (pnpm + Turborepo), TypeScript base config
- [x] `packages/shared` (schemas, constants) with tests
- [x] `apps/api`: Express 5, Helmet, strict CORS, env validation, error envelope, health endpoint, tests
- [x] `apps/web`: Next.js App Router, Tailwind with brand tokens, Inter, status page
- [x] CI workflow (typecheck, test, build) and dev container
- [x] Verified locally: install, typecheck, test, build, web-to-API smoke test
- [ ] GitHub repository created and code pushed (needs owner)
- [ ] CI run green on GitHub (needs repo)
- [ ] MongoDB Atlas cluster + `MONGODB_URI` (needs owner)
- [ ] Vercel project for web; API host chosen and deployed
- [ ] Cloudinary and Resend accounts (needed from M3 onward)

## Pending (not started)
M2 design system, M3 auth/onboarding/profile, M4 nutrition, M5 workouts, M6 hydration/metrics/dashboard, M7 hardening, M8 releases 1.1/1.2, M9 production, M10 approval.
Security items assigned to M3: CSRF protection, refresh-token rotation, RBAC, consent, audit logs.
