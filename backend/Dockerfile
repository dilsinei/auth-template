# backend/dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Atualizar npm para a versão mais recente
RUN npm install -g npm@latest

# Copiar package.json
COPY package*.json ./

# Instalar dependências (produção apenas)
RUN npm install --omit=dev --verbose

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Instalar dumb-init para melhor gerenciamento de processos
RUN apk add --no-cache dumb-init

# Copiar node_modules do builder
COPY --from=builder /app/node_modules ./node_modules

# Copiar código-fonte
COPY src ./src
COPY server.js .
COPY package.json .

# Criar usuário não-root por segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]

#######################################################