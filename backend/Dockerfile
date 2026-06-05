# syntax=docker/dockerfile:1
# Imagen de produccion para el backend NestJS de eqapk.
# Build context: la carpeta backend/ (ver docker-compose.yml en la raiz).

# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# openssl: requerido por el motor de migraciones de Prisma en Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Dependencias (instala todo, incl. dev: se necesita nest CLI + prisma CLI)
COPY package*.json ./
RUN npm ci

# Generar el cliente de Prisma para el target (Alpine/musl)
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npx prisma generate

# Compilar NestJS -> dist/src/main.js
COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npx nest build


# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app
ENV NODE_ENV=production

# Copiamos node_modules completos del builder (incluye Prisma CLI + cliente
# generado + dotenv que usa prisma.config.ts). Mantiene paridad con el build
# de Render, donde `prisma migrate deploy` ya funciona.
COPY --from=builder --chown=node:node /app/node_modules     ./node_modules
COPY --from=builder --chown=node:node /app/dist             ./dist
COPY --from=builder --chown=node:node /app/prisma           ./prisma
COPY --from=builder --chown=node:node /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=node:node /app/package.json     ./package.json

USER node
EXPOSE 3000

# Aplica migraciones pendientes y arranca. El seed NO corre aca (se ejecuta una
# sola vez a mano para no pisar contrasenas en cada deploy).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
