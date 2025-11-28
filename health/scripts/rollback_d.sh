#!/bin/bash
set -e

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "❌ ERRO: Você deve informar a versão!"
  echo "👉 Exemplo: bash rollback_d.sh v1"
  exit 1
fi

BASE_DIR="$(cd "$(dirname "$0")"/.. && pwd)"
VERSIONS_DIR="$BASE_DIR/versions/$VERSION"

BACKEND_TAR="$VERSIONS_DIR/backend_$VERSION.tar.gz"
FRONTEND_TAR="$VERSIONS_DIR/frontend_$VERSION.tar.gz"
DB_BACKUP="$BASE_DIR/db_backups/$VERSION/db_$VERSION.sql.gz"

echo "===================================================="
echo "        🔄 INICIANDO ROLLBACK PARA $VERSION"
echo "===================================================="

# ---------- Validar arquivos ----------
echo "🔍 Validando arquivos necessários..."

[ ! -f "$BACKEND_TAR" ] && echo "❌ backend_$VERSION.tar.gz NÃO encontrado!" && exit 1
[ ! -f "$FRONTEND_TAR" ] && echo "❌ frontend_$VERSION.tar.gz NÃO encontrado!" && exit 1
[ ! -f "$DB_BACKUP" ] && echo "❌ Backup do banco db_$VERSION.sql.gz NÃO encontrado!" && exit 1

echo "✔ Arquivos OK!"

# ---------- Parar containers ----------
echo "🛑 Parando containers..."
docker compose down

# ---------- Restaurar BACKEND ----------
echo "♻ Restaurando BACKEND..."
docker load < "$BACKEND_TAR"

# ---------- Restaurar FRONTEND ----------
echo "♻ Restaurando FRONTEND..."
docker load < "$FRONTEND_TAR"

# ---------- Restaurar BANCO ----------
echo "🗄 Restaurando banco de dados..."
bash "$BASE_DIR/scripts/restore_db.sh" "$VERSION"

# ---------- Subir containers ----------
echo "🚀 Subindo containers..."
docker compose up -d

echo "===================================================="
echo "      ✅ ROLLBACK PARA $VERSION FINALIZADO!"
echo "===================================================="
