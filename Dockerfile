# Build Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN apt-get update && apt-get install -y git
RUN npm install
COPY frontend/ ./
RUN npm run build

# Build Backend
FROM node:20-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN apt-get update && apt-get install -y git openssl
RUN npm install
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Production Image
FROM node:20-slim
WORKDIR /app

# Instalar dependências de sistema (chromium pro baileys, openssl pro prisma)
RUN apt-get update && apt-get install -y chromium openssl procps && rm -rf /var/lib/apt/lists/*

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
