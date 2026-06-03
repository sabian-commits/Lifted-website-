# Lifted · See · Grow · Multiply

The First Impressions Ministry platform for Lifted Church. Phase 1 is the
**Volunteer Portal** — the See → Grow → Multiply pipeline with the Serve Honor
System (star/stem ladder, the 4 trainings, recognition, gap-leader reporting,
and the approval engine). Built as an installable PWA, bilingual EN/ES.

> "People stay where they can grow."

## Running it locally

Node is installed at `~/.local/node` (not on the global PATH). Prefix commands:

```sh
export PATH="$HOME/.local/node/bin:$PATH"
cd ~/lifted-platform
npm run dev          # Turbopack dev server at http://localhost:3000
```

### Note on the preview server / Turbopack
Under some restricted environments, Turbopack's PostCSS/Tailwind step fails to
spawn its helper process. If you hit a Turbopack panic about
"spawning node pooled process", run with webpack instead:

```sh
node node_modules/next/dist/bin/next dev --webpack
```

`scripts/dev.sh` does exactly this and is what the Claude preview panel uses.

## What's here (Phase 1)

| Area | Route | Notes |
| --- | --- | --- |
| Landing | `/` | See · Grow · Multiply + the 5-stage pipeline |
| My Journey | `/dashboard` | Current level, next step, training gate, advancement request, recognition |
| Trainings | `/trainings` | The 4 trainings; "mark complete" creates a Form B record |
| The Ladder | `/ladder` | Full 1★→7★ ladder incl. the intentional 4★/6★ gaps |
| Lead | `/admin` | Approvals queue, roster, recognition, weekly reports, health (lead-only) |

The **demo role switcher** in the top bar stands in for real auth — switch
between a volunteer, gap leader, Ministry Lead, and Pastor to see each view.
Demo data lives in memory and resets on reload.

## Architecture

```
src/
  lib/
    types.ts            domain model (roles, ladder, awards, etc.)
    ministry.ts         the Serve Honor System definitions (ladder, trainings, zones)
    approval-engine.ts  PURE rules: training gate + time-defaults + authority — testable, isolated
    seed.ts             demo data (a realistic mid-season team)
    store.tsx           React context store + mutations (the swap point for Supabase)
  messages/{en,es}.ts   bilingual dictionary (keys kept in sync)
  components/           AppShell (nav, language, role switcher), ui (StemMeter, chips)
  app/                  routes + manifest.ts (PWA) + icon.svg
```

All ministry content is sourced from the `lifted_ministry_playbook` Google Doc —
the app **encodes** that playbook, it does not reinvent it. When the playbook
changes, update `ministry.ts` and `messages/*`.

### The approval engine (the heart of the system)
`approval-engine.ts` enforces, in one place:
- **Hard gate:** no star without the matching training completion on file.
- **1★** Ministry Lead, active decision (no default).
- **2★/3★** Ministry Lead, 7-day window, silence = approval (`resolveStatus`).
- **5★** Senior Pastor, 14-day window, explicit only — never auto-approves.
- **7★** Joint Ministry Lead + Pastor, no default, personal conversation required.

## Path to production (next phases)

1. **Wire Supabase** — replace the in-memory `store.tsx` with Supabase (Postgres
   + Auth + Row-Level Security). The data model in `types.ts` maps 1:1 to tables.
   RLS matters: this stores sensitive congregant data.
2. **DNA workbook + tracking** (Phase 2) — fillable bilingual lessons → submissions
   → member tracking dashboard (baptism, lesson progress, ministry, life group).
3. **Lifted Coach** (Phase 3) — Claude API companion with RAG over church content.
4. **Events / info hub** (Phase 4).

See the plan at `~/.claude/plans/grab-the-resources-from-curried-rabin.md`.

## To-do / polish
- Replace `app/icon.svg` with PNG icons (192/512) for full iOS install fidelity.
- Finalize the 3Rs wording (pending in the playbook) — currently a placeholder.
- Add a gap-leader "submit weekly report" form (admin currently shows reports).
