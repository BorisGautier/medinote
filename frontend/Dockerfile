# ─── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Production stage ─────────────────────────────────────
FROM nginx:1.25-alpine AS production

# Copier le build
COPY --from=builder /app/dist /usr/share/nginx/html

# Config Nginx pour SPA (React Router)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
