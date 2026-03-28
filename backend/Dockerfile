# ─── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# ─── Production stage ─────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# dumb-init pour gestion correcte des signaux
RUN apk add --no-cache dumb-init

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier le build
COPY --from=builder /app/dist ./dist

# Créer répertoire logs
RUN mkdir -p logs && chown node:node logs

# Utiliser l'utilisateur node (non-root)
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/app.js"]
