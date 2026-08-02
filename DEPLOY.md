# Deploying to Hostinger VPS via Coolify

Stack: Next.js 16 (standalone) in Docker → Coolify → Neon Postgres (external).

Files added for this: `Dockerfile`, `.dockerignore`, `.env.example`, and
`output: "standalone"` in `next.config.ts`.

---

## 1. Push to GitHub

The project isn't in git yet. From the project root:

```bash
git init
git add .
git commit -m "Initial commit"
```

Create an **empty private repo** on GitHub (no README, no .gitignore — it must be
empty), then:

```bash
git remote add origin https://github.com/<your-username>/<repo>.git
git branch -M main
git push -u origin main
```

`.env.local` is gitignored and won't be pushed. `.env.example` will be — that's
intentional, it documents the required variables and contains no secrets.

---

## 2. Connect GitHub to Coolify

In the Coolify panel:

1. **Sources** → **+ Add** → **GitHub App**
2. Name it (e.g. `github`), keep defaults, **Save**
3. Click **Register Now / Install** — this opens GitHub
4. Pick your account → **Only select repositories** → select your repo → **Install**
5. GitHub redirects back to Coolify

One-time setup; future repos reuse this source.

---

## 3. Create the application

1. **Projects** → your project → **Environment: production** → **+ New Resource**
2. **Applications → Git Based** → **Private Repository (with GitHub App)**
3. Select the source, the repo, branch `main`
4. **Build Pack**: **Dockerfile** — not Nixpacks. The Dockerfile in the repo is
   tuned for Next standalone and injects the build-time env placeholders the
   build needs.
5. **Ports Exposes**: `3000`
6. **Continue**

---

## 4. Domain

No domain yet, so use Coolify's wildcard DNS. In the app's **General** tab set
**Domains** to:

```
http://store-admin.<YOUR_VPS_IP>.sslip.io
```

e.g. for `72.60.10.5` → `http://store-admin.72.60.10.5.sslip.io`

`sslip.io` resolves any `*.<ip>.sslip.io` to that IP, no DNS config needed. Keep
it `http://` — Let's Encrypt won't reliably issue certs for sslip.io hostnames.

> Or just use `http://<YOUR_VPS_IP>:3000` and hit the IP directly.

---

## 5. Environment variables

App → **Environment Variables**. Add these as **runtime** variables (leave
"Build Variable" unchecked — the Dockerfile already has build-time placeholders):

| Key | Value |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string, ending `?sslmode=require` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | exactly the URL from step 4, **no trailing slash** |

The `INITIAL_ADMIN_*` vars are only read by `npm run auth:create-admin`, which
runs on your machine. Don't add them to Coolify.

`BETTER_AUTH_URL` must match the URL you browse to exactly — better-auth uses it
for cookie domain and `trustedOrigins`, and a mismatch silently breaks login.

Neon pooled URL: Neon dashboard → project → **Connect** → **Pooled connection**.

---

## 6. Deploy

Hit **Deploy**. First build is ~4–7 min (`npm ci` + `next build`). The log should
end with `exporting to image` and the container going healthy.

---

## 7. Migrations and the first admin

`drizzle-kit` and `tsx` are devDependencies and aren't in the runtime image, so
run these from your machine — Neon is reachable from anywhere:

```bash
npm run db:migrate         # applies drizzle/*.sql
npm run auth:create-admin  # uses INITIAL_ADMIN_* from .env.local
```

Both read `.env.local`, so point `DATABASE_URL` there at the same Neon database
Coolify uses. Do this once before your first login.

---

## 8. Auto-deploy

The GitHub App installs a webhook automatically. Confirm **Automatic Deployment**
is enabled under the app's **Webhooks** tab. After that, `git push` to `main`
rebuilds.

---

## Later: real domain + HTTPS

1. Add an `A` record pointing at the VPS IP
2. Change **Domains** in Coolify to `https://yourdomain.com`
3. Update `BETTER_AUTH_URL` to match
4. Redeploy — Traefik requests the Let's Encrypt cert automatically

---

## Verified locally

I ran the full pipeline in a Linux sandbox against this code:

- `tsc --noEmit` — clean
- `next build` — compiles, type-checks, generates all 27 routes
- `.next/standalone` produced at 42 MB with `server.js` at the root (so the
  Dockerfile's `COPY` paths are right)
- `node server.js` with `HOSTNAME=0.0.0.0` starts and serves `/login` → 200

---

## Troubleshooting

**Build fails: "Failed to fetch Geist from Google Fonts"** — `src/app/layout.tsx`
uses `next/font/google`, which downloads fonts during the build. The VPS needs
outbound HTTPS to `fonts.googleapis.com`; it will by default. If you ever build
somewhere network-restricted, switch to `next/font/local` with the woff2 files
committed under `public/`.

**Build fails: "DATABASE_URL is missing"** — `src/db/index.ts` throws at import
time and `next build` imports it during prerender. The Dockerfile's builder stage
sets a placeholder. If you add another import-time-required env var, add a
placeholder for it there too.

**502 / Bad Gateway** — container is up but the proxy can't reach it. Check
**Ports Exposes** is `3000` and that the runner stage keeps `HOSTNAME=0.0.0.0`
(Next standalone binds to localhost otherwise, which is invisible to Traefik).

**Login redirect loop** — `BETTER_AUTH_URL` doesn't match the browsed URL.
Compared exactly: scheme, host, port, no trailing slash. Also relevant to
`src/proxy.ts`, which redirects unauthenticated users to `/login`.

**Out of memory during build** — Hostinger's smaller plans can be tight. Add swap
on the VPS:

```bash
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```
