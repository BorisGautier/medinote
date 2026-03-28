FROM node:22-slim AS builder
WORKDIR /app

# Installer build-essential pour les dépendances natives si besoin
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:22-slim AS production
WORKDIR /app

ENV NODE_ENV=production

# dumb-init pour gestion correcte des signaux
RUN apt-get update && apt-get install -y dumb-init && rm -rf /var/lib/apt/lists/*

# Copier uniquement les dépendances de production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

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
