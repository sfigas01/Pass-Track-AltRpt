# Replit → Railway migration runbook

The code changes (Google login, standard Postgres driver, Replit removal, `/health`, `railway.json`) are already in the repo. These are the steps that need your accounts. Do them in order.

## 1. Google OAuth client (~10 min)

1. Google Cloud Console → create (or pick) a project → **APIs & Services → OAuth consent screen**. Choose **External**, fill in the app name and your email. While it is in **Testing** mode, add your Gmail address under **Test users**.
2. **Credentials → Create credentials → OAuth client ID → Web application.**
3. **Authorized redirect URIs**: add both of these:
   - `http://localhost:5000/api/callback` (local dev)
   - `https://<your-railway-domain>/api/callback`. You get the domain in step 2.4. Come back and add it then.
4. Copy the **Client ID** and **Client secret**.

## 2. Railway project (~15 min)

1. Railway → **New Project → Deploy from GitHub repo** → `sfigas01/Pass-Track-AltRpt`, branch `main`.
2. In the same project: **New → Database → PostgreSQL**.
3. App service → **Variables**. Add:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference variable; uses the private network) |
   | `SESSION_SECRET` | output of `openssl rand -hex 32` (new value, don't reuse the Replit one) |
   | `GOOGLE_CLIENT_ID` | from step 1 |
   | `GOOGLE_CLIENT_SECRET` | from step 1 |
   | `ALLOWED_EMAILS` | your Google email, the **same email your Replit account used**, so your existing data links to you |
   | `PUBLIC_URL` | `https://<your-railway-domain>` |

   Railway sets `PORT` itself. `NODE_ENV=production` is set by `npm run start`.
4. App service → **Settings → Networking → Generate Domain**. Use it for `PUBLIC_URL`, and add the callback URI in Google (step 1.3).
5. Check **Settings** shows the build/start commands and `/health` healthcheck from `railway.json`.
6. Account → **Usage**: set a usage limit / spend alert.

The first deploy will pass the healthcheck but login will fail until the database has tables. That's step 3.

## 3. Database

Replit's database is Neon Postgres. Get its connection string from the Replit **Database** pane (or the `DATABASE_URL` secret) on the **production** deployment. Replit keeps dev and production databases separate; make sure you export the one holding your real passes.

Get Railway's external connection string from Postgres service → **Variables → `DATABASE_PUBLIC_URL`**.

Your local `pg_dump` must be the same major version as the Replit server or newer. Check with `psql "$REPLIT_DB" -c 'select version()'`.

### Rehearsal (do this first, any time)

```bash
export REPLIT_DB='postgres://...'       # Replit production DB
export RAILWAY_DB='postgres://...'      # Railway DATABASE_PUBLIC_URL

pg_dump "$REPLIT_DB" -Fc --no-owner --no-acl --exclude-table-data=sessions -f passtrack.dump
pg_restore --no-owner --no-acl -d "$RAILWAY_DB" passtrack.dump
```

Then check counts match on both sides:

```bash
for db in "$REPLIT_DB" "$RAILWAY_DB"; do
  psql "$db" -Atc "select 'users', count(*) from users union all
                   select 'class_passes', count(*) from class_passes union all
                   select 'usage_sessions', count(*) from usage_sessions union all
                   select 'class_bookings', count(*) from class_bookings"
  echo ---
done
```

Log in on the Railway URL. You should see your existing passes. If you see an empty dashboard, the Google email doesn't match the email stored in `users`; check with `psql "$RAILWAY_DB" -c 'select id, email from users'`.

### Final cutover

1. Stop using the Replit app (so nothing new is written there).
2. Reset the Railway DB and restore a fresh dump:
   ```bash
   psql "$RAILWAY_DB" -c 'drop schema public cascade; create schema public;'
   pg_dump "$REPLIT_DB" -Fc --no-owner --no-acl --exclude-table-data=sessions -f passtrack-final.dump
   pg_restore --no-owner --no-acl -d "$RAILWAY_DB" passtrack-final.dump
   ```
3. Re-run the count check, log in, spot-check recent passes/sessions.
4. Keep `passtrack-final.dump` somewhere safe (not in the repo) until Replit is shut down.

### Starting with an empty database instead

If you don't need the Replit data, create the tables directly:

```bash
DATABASE_URL="$RAILWAY_DB" npm run db:push
```

## 4. Verify

- `https://<domain>/health` returns `{"status":"ok"}`
- Login works with your email; any other Google account is sent back to the landing page
- Add a pass, log a session, archive/unarchive, logout
- Railway **Deployments → Logs** show no errors
- Push a small change to `main` and confirm it auto-deploys

## 5. Decommission Replit (after a week or so of stable use)

- Delete the Replit deployment and cancel the Replit plan.
- Treat every secret that lived in Replit as burned. `SESSION_SECRET` is already new if you followed step 2.
- Delete the local `.dump` files once you're confident.
