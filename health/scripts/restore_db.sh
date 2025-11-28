#!/bin/bash

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Uso: ./health/scripts/restore_db.sh v1"
  exit 1
fi

BACKUP_FILE="health/db_backups/$VERSION/db_$VERSION.sql.gz"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ ERRO: Arquivo $BACKUP_FILE não encontrado!"
  exit 1
fi

echo "🛑 Derrubando containers..."
docker compose down

echo "🚀 Subindo apenas PostgreSQL..."
docker compose up -d postgres

echo "⏳ Aguarde alguns segundos..."
sleep 5

echo "📂 Resetando banco atual..."
docker exec -t login_postgres psql -U postgres -d login_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

echo "📥 Restaurando banco versão $VERSION..."
gunzip -c "$BACKUP_FILE" | docker exec -i login_postgres psql -U postgres -d login_db

echo "🚀 Subindo todo o sistema..."
docker compose up -d

echo "🎉 Banco restaurado para versão $VERSION!"
