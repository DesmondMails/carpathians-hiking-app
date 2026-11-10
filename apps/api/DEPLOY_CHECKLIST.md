# API deploy checklist

Run through this before every production deploy. Every environment variable
below is read on startup. A missing required one stops the app with
`Missing required config` or a `getOrThrow` error, which is what you want.

## 1. Database (PostgreSQL + PostGIS)

- [ ] The Postgres host supports the **PostGIS** extension. Migration
      `20261104110859_add_postgis` runs `CREATE EXTENSION postgis`, so the DB
      user needs permission to create extensions.
- [ ] `DATABASE_URL` points at the production database.
- [ ] Generate the Prisma client before building. `src/prisma/generated` is not
      committed:
      ```bash
      npx prisma generate && npm run build
      ```
- [ ] Apply migrations with `migrate deploy`. Never use `migrate dev`, which
      the `make migrate` target runs; it can reset data.
      ```bash
      npx prisma migrate deploy
      ```
- [ ] Back up the database before running migrations.

## 2. Redis (BullMQ: POI enrichment queue)

- [ ] `REDIS_HOST` and `REDIS_PORT` are set.
- [ ] Redis is **not** exposed to the internet.
- [ ] Redis `maxmemory-policy` is set to `noeviction`. BullMQ loses jobs under
      any other policy.
- [ ] **Managed Redis that needs a password or TLS won't work yet.** The
      connection in `src/app.module.ts` passes only host and port. Add
      `password` / `tls` there first, or use a Redis instance on a private
      network.
- [ ] The enrichment worker runs inside the API process, so no separate worker
      deployment is needed.

## 3. Auth

- [ ] `JWT_SECRET` and `JWT_REFRESH_TOKEN_SECRET` are long random values, at
      least 32 bytes (`openssl rand -base64 48`), and **different** from each
      other.
- [ ] `JWT_ACCESS_TOKEN_EXPIRATION` (e.g. `15m`) and
      `JWT_REFRESH_TOKEN_EXPIRATION` (e.g. `7d`) are set.
- [ ] Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and
      `GOOGLE_CALLBACK_URL` are set.
  - [ ] The production callback URL is added under *Authorized redirect URIs*
        in Google Cloud Console.
  - [ ] The mobile app requests Google ID tokens for this same
        `GOOGLE_CLIENT_ID`, because `/auth/google/native` checks the token's
        audience against it.
- [ ] **First deploy after the refresh-token fix:** stored refresh-token hashes
      no longer match, so every user has to log in again once. Make sure the
      mobile app sends users to the login screen when `/auth/refresh` returns
      `401`.

## 4. Rate limiting and proxy

- [ ] `TRUST_PROXY_HOPS` is set to the number of reverse proxies in front of
      the API: `1` for a single load balancer or nginx, `2` for Cloudflare in
      front of nginx. Leave it unset only if clients connect to Node directly.
      **Don't overcount**: an extra hop lets clients spoof their IP and skip
      rate limits.
- [ ] After deploying, check `req.ip` once (e.g. with a temporary log line). It
      should show your real public IP, not a private `10.x` / `172.x` address.
- [ ] Run **one API instance**, or move throttler storage to Redis. Limits are
      kept in each instance's memory, so N instances allow N× the requests.

## 5. Email (AWS SES)

- [ ] `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and
      `SES_FROM_EMAIL` are set.
- [ ] The SES account has **production access**. In the sandbox, it can only
      send to verified addresses, so new users would never get their code.
- [ ] The sender domain is verified in SES, with SPF and DKIM DNS records.
- [ ] The IAM key is limited to `ses:SendEmail`.

## 6. File storage (Cloudflare R2)

- [ ] `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID` and `R2_SECRET_ACCESS_KEY`
      are set.
- [ ] Optional: `R2_PUBLIC_BASE_URL` (public/CDN domain for images),
      `R2_REGION` (default `auto`), `R2_PRESIGNED_URL_TTL_SECONDS` (default
      `900`).
- [ ] Use a separate production bucket. The R2 token is scoped to that bucket
      only.

## 7. External APIs

- [ ] `GEOAPIFY_API_KEY` is set (reverse geocoding on GPX import). Check the
      plan's request quota.
- [ ] Optional: `OVERPASS_API_URL` and `OVERPASS_USER_AGENT`. Set a real user
      agent with contact info; the public Overpass server may block the
      default one.

## 8. Before going live

- [ ] `npm run test` passes.
- [ ] `PORT` is set if the host expects something other than `3000`.
- [ ] Secrets live in the host's secret manager, not in a committed `.env`
      (`.env*` is gitignored; keep it that way).
- [ ] Decide whether Swagger at `/api` should be public in production. It
      currently documents every endpoint.
- [ ] Smoke test: sign up, verify email, log in, refresh, `GET /users/me`, then
      log out. Call `/auth/login` 6 times with a wrong password and expect
      `429` on the 6th.
