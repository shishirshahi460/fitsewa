# Decisions log

| # | Decision | Reason |
|---|---|---|
| D1 | Website first; mobile only after approval | Owner decision |
| D2 | Monorepo (pnpm workspaces + Turborepo) with shared package | One source of truth for schemas; mobile reuse later |
| D3 | Separate Express API (modular monolith) | API-first; web and mobile share it |
| D4 | Latest stable versions at setup time: Next 16, React 19, Express 5, Mongoose 9, Zod 4, TypeScript 7, Vitest 5, Tailwind 4 | Owner decision: no pinning to older majors. Re-evaluate any tool that proves incompatible. |
| D5 | Inter self-hosted via @fontsource-variable/inter | No build-time dependency on Google Fonts; better privacy and reliability |
| D6 | Cloud-first: GitHub + Codespaces dev container, Vercel (web), MongoDB Atlas, Cloudinary | Owner decision |
| D7 | Email via Resend behind an interface, SES-migratable | Owner decision |
| D8 | 18+ at launch; minors need a separate safety review | Owner decision |
| D9 | Food data labelled draft / estimated / verified; nothing verified without professional review | Owner decision |
| D10 | CORS: exact origins only, wildcard rejected at startup | Security baseline |

## Open items (not assumed)
- Domain, trademark, company registration, social handles: unverified. Temporary cloud URLs used.
- Atlas region (Mumbai vs Singapore): decide after latency test.
- API hosting provider: undecided (see M1 report).
- Nutrition reviewer and verified dataset: not yet available.
