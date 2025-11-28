#!/bin/bash

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Uso: ./health/scripts/save_version.sh v1"
  exit 1
fi

echo "🔧 Construindo imagens..."
docker compose build

echo "🏷 Criando tags..."
docker tag system-stock-backend:latest system-stock-backend:$VERSION
docker tag system-stock-frontend:latest system-stock-frontend:$VERSION

echo "💾 Salvando imagens..."
mkdir -p health/versions/$VERSION
docker save -o health/versions/$VERSION/backend_$VERSION.tar system-stock-backend:$VERSION
docker save -o health/versions/$VERSION/frontend_$VERSION.tar system-stock-frontend:$VERSION

echo "📦 Compactando..."
gzip health/versions/$VERSION/*.tar

echo "🎉 Versão $VERSION salva com sucesso!"
