# ─── Build stage ──────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Production stage ─────────────────────────────────────
FROM httpd:2.4-alpine AS production

# Configuration Apache
RUN sed -i \
    -e 's/^#\(LoadModule rewrite_module modules\/mod_rewrite.so\)/\1/' \
    -e 's/^Listen 80/Listen 5173/' \
    -e '/<Directory "\/usr\/local\/apache2\/htdocs">/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' \
    /usr/local/apache2/conf/httpd.conf

# Copier le build
COPY --from=builder /app/dist /usr/local/apache2/htdocs/

# Copier le .htaccess pour le routage SPA
COPY .htaccess /usr/local/apache2/htdocs/

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5173/ || exit 1

CMD ["httpd-foreground"]
