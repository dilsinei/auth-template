#!/bin/bash
# ============================================================
# deploy.sh
# Unifica:
#   1. Backup do banco de dados
#   2. Salvar imagens Docker versionadas (backend + frontend)
#   3. Criar pacote versionado completo
# Estrutura esperada:
#   /health
#     /db_backups
#     /scripts
#     /versions
# ============================================================

set -e

### CONFIGURAÇÕES ###
VERSION="v$(date +%Y%m%d_%H%M%S)"     # Exemplo: v20251122_0930
BACKUP_DIR="health/db_backups/$VERSION"
VERSION_DIR="health/versions/$VERSION"

BACKEND_IMAGE="system-stock-backend:latest"
FRONTEND_IMAGE="system-stock-frontend:latest"
POSTGRES_CONTAINER="login_postgres"

mkdir -p "$BACKUP_DIR"
mkdir -p "$VERSION_DIR"

# ============================================================
# 1. BACKUP DO BANCO DE DADOS
# ============================================================
echo "📦 Realizando backup do banco..."
docker exec -t $POSTGRES_CONTAINER pg_dumpall -U postgres | gzip > "$BACKUP_DIR/db_${VERSION}.sql.gz"

echo "✔ Backup do banco salvo em: $BACKUP_DIR/db_${VERSION}.sql.gz"

# ============================================================
# 2. EXPORTAR IMAGENS DOCKER
# ============================================================
echo "📦 Salvando imagens Docker..."

docker save $BACKEND_IMAGE | gzip > "$VERSION_DIR/backend_${VERSION}.tar.gz"
docker save $FRONTEND_IMAGE | gzip > "$VERSION_DIR/frontend_${VERSION}.tar.gz"

echo "✔ Imagens salvas em: $VERSION_DIR"

# ============================================================
# 3. GERAR MANIFESTO DA VERSÃO
# ============================================================
echo "📝 Gerando manifesto de versão..."
cat <<EOF > "$VERSION_DIR/manifest.txt"
Versão: $VERSION
Gerado em: $(date)
Backend Image: $BACKEND_IMAGE
Frontend Image: $FRONTEND_IMAGE
Backup: db_${VERSION}.sql.gz
EOF

echo "✔ Manifesto criado: $VERSION_DIR/manifest.txt"

# ============================================================
# FINAL
# ============================================================
echo "🚀 Deploy finalizado com sucesso!"
echo "📁 Versão salva em: $VERSION_DIR"
