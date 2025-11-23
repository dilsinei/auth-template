#!/bin/bash

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Uso: ./health/scripts/backup_db.sh v1"
  exit 1
fi

BACKUP_DIR="health/db_backups/$VERSION"
mkdir -p $BACKUP_DIR

echo "🗄️ Realizando backup do banco (versão $VERSION)..."

docker exec -t login_postgres pg_dump -U postgres -d login_db > "$BACKUP_DIR/db_$VERSION.sql"

gzip "$BACKUP_DIR/db_$VERSION.sql"

echo "🎉 Backup salvo em $BACKUP_DIR/db_$VERSION.sql.gz"
