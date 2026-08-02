# syntax=docker/dockerfile:1

# ---------- deps ----------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- builder ----------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# src/db/index.ts throws at import time if DATABASE_URL is unset, and
# `next build` imports it while prerendering. These placeholders only exist
# during the build; Coolify's runtime env vars are what the container uses.
ENV DATABASE_URL="postgresql://build:build@build.neon.tech/build?sslmode=require"
ENV BETTER_AUTH_SECRET="build_time_placeholder_secret_min_32_chars"
ENV BETTER_AUTH_URL="http://localhost:3000"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Next's standalone server binds to localhost by default, which is
# unreachable from Coolify's proxy. 0.0.0.0 is required.
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
