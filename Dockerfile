# Stage 1: Build API
FROM node:20 AS api-builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

COPY apps/api/src/prisma ./apps/api/src/prisma
RUN cd apps/api && npx prisma generate

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

RUN cd apps/api && npm run build

# Stage 2: Build Frontend
FROM node:20 AS web-builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

RUN npm install

COPY apps/web ./apps/web
COPY packages/shared ./packages/shared

RUN cp apps/web/.env.production apps/web/.env && cd apps/web && npm run build

# Stage 3: Production API
FROM node:20-slim AS api-runner

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY apps/api/package.json ./apps/api/

COPY --from=api-builder /app/apps/api/dist ./apps/api/dist
COPY --from=api-builder /app/apps/api/src/prisma ./apps/api/src/prisma
COPY --from=api-builder /app/node_modules ./node_modules
COPY --from=api-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=api-builder /app/node_modules/@prisma ./node_modules/@prisma

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

# Stage 4: Nginx for Frontend
FROM nginx:alpine AS web-runner

COPY --from=web-builder /app/apps/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
