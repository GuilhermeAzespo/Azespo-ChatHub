# Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN apk add --no-cache git
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN apk add --no-cache git
RUN npm install
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Production Image
FROM node:20-alpine
WORKDIR /app

# Instalar Chromium (Necessário para o Baileys/Puppeteer interno gerar QR corretamente se precisar) e tzdata
RUN apk add --no-cache tzdata chromium

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Pasta de sessões do WhatsApp (Deve ser mapeada no Easypanel)
RUN mkdir -p /app/sessions

EXPOSE 3000

CMD ["sh", "-c", "cd backend && npx prisma db push && npm start"]
