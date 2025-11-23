#!/bin/bash

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Uso: ./health/scripts/rollback.sh v1"
  exit 1
fi

echo "🛑 Derrubando containers atuais..."
docker compose down

BACKEND_FILE="health/versions/$VERSION/backend_$VERSION.tar.gz"
FRONTEND_FILE="health/versions/$VERSION/frontend_$VERSION.tar.gz"

if [ ! -f "$BACKEND_FILE" ]; then
    echo "❌ ERRO: Arquivo $BACKEND_FILE não encontrado!"
    exit 1
fi

if [ ! -f "$FRONTEND_FILE" ]; then
    echo "❌ ERRO: Arquivo $FRONTEND_FILE não encontrado!"
    exit 1
fi

echo "🔄 Carregando imagens versão $VERSION..."
docker load -i "$BACKEND_FILE"
docker load -i "$FRONTEND_FILE"

echo "🚀 Subindo containers restaurados..."
docker compose up -d

echo "🎉 Rollback versão $VERSION concluído!"
