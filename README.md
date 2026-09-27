A beautiful, simple web app to track fitness class passes, monitor spending, and visualize usage patterns.

This app was created in a few hours using Replit Agent to learn more about vibe coding with Replit without development knowledge.
It has a database and is functioning but is not yet set up for multiple user profiles. 

<img width="778" height="634" alt="Screenshot 2025-09-21 at 8 07 01 PM" src="https://github.com/user-attachments/assets/4cdedf85-242b-48cc-9329-cedd62f40e8f" />

## Hosting

Runs on [Railway](https://railway.com) as a single Node service with Railway Postgres, and uses Google sign-in restricted to an email allowlist. See `docs/railway-migration.md` for setup and `ARCHITECTURE.md` for how the app is built.

## Local development

```bash
cp .env.example .env     # fill in the values
npm install
npm run db:push          # create tables in your local database
npm run dev              # http://localhost:5000
```
