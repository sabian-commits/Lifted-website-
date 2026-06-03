// Applies all SQL migrations in supabase/migrations/ in order.
// Requires DATABASE_URL (Supabase Session pooler URI) in the environment.
//   node --env-file=.env.local scripts/migrate.mjs
// Migrations are written idempotently (IF NOT EXISTS / DROP POLICY IF EXISTS),
// so re-running is safe.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error("Missing DATABASE_URL. Add the Supabase Session pooler URI to .env.local.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "supabase", "migrations");

const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

(async () => {
  await client.connect();
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = await readFile(path.join(dir, f), "utf8");
    process.stdout.write(`Applying ${f} ... `);
    await client.query(sql);
    console.log("ok");
  }
  await client.end();
  console.log(`\n${files.length} migration(s) applied.`);
})().catch(async (e) => {
  console.error("\nMigration failed:", e.message);
  try { await client.end(); } catch {}
  process.exit(1);
});
