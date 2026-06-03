# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The import above is load-bearing: this is **Next.js 16**, which renamed/changed conventions vs. older versions (e.g. `middleware.ts` → `proxy.ts`). Read `node_modules/next/dist/docs/` for the relevant convention before writing app/route code.

## What this is

Lifted — the First Impressions ministry platform for Lifted Church, delivered as an installable, bilingual (EN/ES) PWA. It runs the **See · Grow · Multiply** pipeline: the volunteer Serve Honor System, an Events/Info hub, and the "Lifted Coach" AI companion. The ministry content is the source of truth in the `lifted_ministry_playbook` Google Doc — **the app encodes that playbook; it does not invent ministry rules.**

## Environment & commands

Node is installed at `~/.local/node` and is **not on the global PATH**. Prefix every command:

```sh
export PATH="$HOME/.local/node/bin:$PATH"
```

- **Dev server:** `npm run dev` (Turbopack, port 3000).
  - Turbopack's PostCSS step crashes under sandboxed/preview spawners. If you see a panic about "spawning node pooled process", run webpack instead: `node node_modules/next/dist/bin/next dev --webpack`. `scripts/dev.sh` does exactly this and is what the Claude preview panel launches via `.claude/launch.json`.
- **Type-check:** `npx tsc --noEmit` — the primary correctness gate; run it after edits. (Stale errors under `.next/dev/types/` after moving route files clear with `rm -rf .next` + a dev rebuild.)
- **Build / lint:** `npm run build` · `npm run lint`.
- **There is no test framework.** Verification is type-check + the Node scripts below + clicking through the preview.

### Database scripts (Supabase)

All require `.env.local` (gitignored) with `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and (for migrations) `DATABASE_URL` (Supabase Session pooler URI).

- **Apply migrations:** `node --env-file=.env.local scripts/migrate.mjs` — runs every `supabase/migrations/*.sql` in order. Migrations are written idempotently (`if not exists`, `drop policy if exists`), so re-running is safe. Without `DATABASE_URL`, paste the SQL into the Supabase SQL Editor instead.
- **Seed demo data:** `node --env-file=.env.local scripts/seed.mjs` — creates the 8-person demo team as real auth users (shared password `LiftedDemo1!`) and resets all dynamic tables. Uses the service-role key.
- **Verify RLS / data live:** ad-hoc scripts in the repo root signing in with the anon key (the pattern in past `verify.mjs`/`vev.mjs`) — run from the project root so `@supabase/supabase-js` resolves.

## Architecture

### Rendering & auth flow
- Next 16 App Router, React 19, Tailwind v4 (CSS-config in `src/app/globals.css`, no `tailwind.config`), TypeScript.
- **`src/proxy.ts`** (Next 16's renamed middleware — exports `proxy`, not `middleware`) refreshes the Supabase session on every request and redirects unauthenticated users to `/login`. Public paths: `/`, `/login`, `/auth/*`, the manifest.
- **Route groups split public from authenticated:**
  - Root `src/app/layout.tsx` wraps everything in `LanguageProvider` only. Public pages (`/` landing, `/login`, `/auth/callback`) live here.
  - `src/app/(app)/layout.tsx` adds `StoreProvider` + `AppShell` + a loading/auth `Gate`. All authenticated pages (`dashboard`, `trainings`, `ladder`, `events`, `coach`, `report`, `admin`) live under `(app)/` and are `"use client"`.

### Two contexts (important)
- **`src/lib/i18n.tsx` — `LanguageProvider` / `useLang()`**: lightweight `{ lang, setLang, t }`, available on every page including public ones.
- **`src/lib/store.tsx` — `StoreProvider` / `useStore()`**: the Supabase-backed data layer. On mount (and on auth change) it loads every table the user may see, sets `viewer` from the logged-in profile, and exposes async mutations. It **re-exposes `t`/`lang`/`setLang` from `useLang`**, so authenticated pages get i18n *and* data from a single `useStore()` call. `viewer` is `Volunteer | null`; pages guard with `if (!viewer) return null;`.

### Domain logic
- **`src/lib/approval-engine.ts`** — pure, testable Serve Honor System rules: the training gate (no star without the matching training on file), time-defaults (2★/3★ auto-approve after 7 days, 5★/7★ never), and approval authority. Keep ministry rules here, not in components.
- **`src/lib/ministry.ts`** — static config: the 1★→7★ ladder (with intentional 4★/6★ gaps), the 4 trainings, the 4 zones. Sourced from the playbook.
- **`src/lib/types.ts`** — domain types. DB rows are snake_case; the `map*` helpers in `store.tsx` convert to these camelCase types.

### Data & RLS
- Schema lives in `supabase/migrations/*.sql`, **every table under Row-Level Security** — this stores sensitive congregant data (baptism status, spiritual progress). SQL helper functions `auth_role()` / `is_lead()` / `can_report()` (SECURITY DEFINER, avoid RLS recursion) drive the policies. Volunteers see only their own records; leads (`ministry_lead`/`pastor`) see the ministry; escalations and reports are lead/reporter-only.
- Supabase clients: `src/lib/supabase/{client,server,admin}.ts` (browser anon / server-cookies anon / service-role server-only).

### Lifted Coach (AI)
- `src/app/api/coach/route.ts` (GET history, POST a turn) + `src/lib/coach-prompt.ts`. Uses `@anthropic-ai/sdk`, model `claude-opus-4-8` (swap `COACH_MODEL` to `claude-haiku-4-5` to cut cost), with the playbook system prompt cached via `cache_control`. Conversations persist in `coach_messages` (private per-user RLS). Needs `ANTHROPIC_API_KEY`; degrades gracefully when absent.

### i18n
- `src/messages/{en,es}.ts` are flat `key → string` maps. **Keep keys in sync across both files.** Reference keys via `t("some.key")`.

## Adding a persisted feature (the repeating pattern)
1. New `supabase/migrations/000N_*.sql` with the table **and** its RLS policies; apply via `migrate.mjs`.
2. Add the type to `src/lib/types.ts` and a `map*` helper + state + load query + mutation(s) in `src/lib/store.tsx`.
3. Build the page under `src/app/(app)/...` as a `"use client"` component using `useStore()`.
4. Add the nav entry in `src/components/AppShell.tsx` (with `leadOnly`/`reportOnly` if gated) and the strings in both `messages/*` files.
