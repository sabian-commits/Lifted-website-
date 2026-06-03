# Deploying Lifted to Vercel

The app is a standard Next.js 16 project — Vercel auto-detects it, no `vercel.json` needed.
A production build is confirmed passing locally (`npm run build`).

## One-time setup

1. **Push the repo to GitHub** (if not already):
   ```sh
   git remote add origin git@github.com:<you>/lifted-platform.git
   git push -u origin main
   ```

2. **Import to Vercel**: vercel.com → Add New → Project → pick the repo.
   Framework preset: **Next.js** (auto). Build command and output are auto-detected.

   Or via CLI (requires interactive login — run in your own terminal):
   ```sh
   export PATH="$HOME/.local/node/bin:$PATH"
   npx vercel login
   npx vercel          # preview deploy
   npx vercel --prod   # production deploy
   ```

3. **Set Environment Variables** in Vercel (Project → Settings → Environment Variables).
   Use the same values as `.env.local`, for the **Production** (and Preview) environments:

   | Variable | Notes |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | public |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public |
   | `SUPABASE_SERVICE_ROLE_KEY` | **secret** — server only |
   | `ANTHROPIC_API_KEY` | **secret** — needed for /coach |
   | `COACH_MODEL` | optional, e.g. `claude-haiku-4-5` to cut cost |

   `DATABASE_URL` is only used by the local `migrate.mjs` script — it does **not** need to
   be set in Vercel.

## After the first deploy

4. **Add the deployed callback URL to Supabase** (Dashboard → Authentication → URL
   Configuration):
   - **Site URL**: `https://<your-app>.vercel.app`
   - **Redirect URLs**: add `https://<your-app>.vercel.app/auth/callback`

   Without this, magic-link / password login will reject the production redirect.

5. **Production email**: Supabase's built-in email is rate-limited and not for real users.
   Before onboarding real volunteers, wire up Resend or SendGrid as the SMTP provider in
   Supabase Auth settings.

6. **PWA install**: once live over HTTPS, the manifest + icons make it installable on
   phones (Add to Home Screen). Verify `https://<your-app>.vercel.app/manifest.webmanifest`
   loads.

## Pre-deploy checklist
- [ ] `npm run build` passes locally
- [ ] All env vars set in Vercel (incl. `ANTHROPIC_API_KEY` if Coach should be live)
- [ ] Migrations applied to the Supabase project (incl. `0003_coach.sql`, `0004_multiply.sql`)
- [ ] Supabase redirect URLs updated to the Vercel domain
- [ ] Rotate the `SUPABASE_SERVICE_ROLE_KEY` (it was shared in chat earlier)
