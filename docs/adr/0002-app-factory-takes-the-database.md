# `createApp(db)` builds the app, so a test can inject a database

`createApp(db)` constructs the Elysia app and decorates that database for handlers; `index.ts` exports `app = createApp(createDb(env.DATABASE_URL))`. Until then `context.ts` built the database at import time from `env.DATABASE_URL`, so an API test that touched data read and wrote the developer's database — the repository already carried two `local.db` files, depending on the working directory.

## Considered options

- **Setting `process.env.DATABASE_URL` before importing the app.** No production change, but it needs a dynamic `import()` to beat the import-time read, and when that ordering slips the test silently runs against the real database.
- **Cleaning rows inside the development database.** Needs no seam, but test files then interfere with each other and with local data.