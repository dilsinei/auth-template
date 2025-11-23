# 📂 Pasta `health`

A pasta **/health** é responsável por armazenar tudo relacionado à **saúde, backup, versionamento e rollback** do sistema.
Ela centraliza scripts, versões salvas e backups do banco de dados, permitindo restaurar o projeto com segurança.

---

## 📁 Estrutura da pasta

```
health/
├── db_backups/
│   └── v1/
│       └── db_v1.sql.gz
├── scripts/
│   ├── backup_db.sh
│   ├── restore_db.sh
│   ├── rollback.sh
│   └── save_version.sh
└── versions/
    └── v1/
        ├── backend_v1.tar.gz
        └── frontend_v1.tar.gz
```

---

## 📌 Objetivo de cada diretório

### **📁 db_backups/**

Armazena os backups compactados do banco de dados PostgreSQL.
Cada subpasta representa uma versão do sistema.

### **📁 scripts/**

Contém todos os scripts automatizados:

-   **backup_db.sh** → gera backup do banco
-   **restore_db.sh** → restaura backup
-   **save_version.sh** → salva imagens do Docker como versão
-   **rollback.sh** → restaura qualquer versão salva

### **📁 versions/**

Armazena pacotes versionados das imagens Docker do backend e frontend.
Cada versão contém dois arquivos:

-   backend_vX.tar.gz
-   frontend_vX.tar.gz

---

## 🚀 Como salvar uma nova versão

Execute dentro da pasta `health/scripts`:

```
./save_version.sh v2
```

Isso irá gerar:

-   `/health/versions/v2/backend_v2.tar.gz`
-   `/health/versions/v2/frontend_v2.tar.gz`
-   `/health/db_backups/v2/db_v2.sql.gz`

---

## ↩️ Como realizar rollback

Para voltar a uma versão anterior:

```
./rollback.sh v1
```

O script irá:

-   Restaurar imagens Docker da versão
-   Restaurar o banco referente à versão
-   Reiniciar os containers

---

## 🗄 Como restaurar apenas o banco

```
./restore_db.sh v1
```

---

## 🧩 Requisitos

-   Docker + Docker Compose instalados
-   Permissão de execução:
    `chmod +x *.sh`

---

## 📌 Observação importante

Sempre execute os scripts dentro da pasta **/health/scripts** para garantir caminhos corretos.

---

## ✔ Manutenção

Este diretório garante que o sistema seja:

-   Seguro contra falhas
-   Fácil de versionar
-   Simples de restaurar
-   Pronto para deploy e rollback

---

📦 criar um fluxo GitHub Actions para buildar e salvar imagens automaticamente
📁 organizar sua estrutura Docker profissionalmente

### Como voltar rapidamente para o snapshot que você já fez (passos práticos)

Supondo que você marcou v1.0.0:

Restaurar código:
git checkout v1.0.0

ou para voltar main para esse ponto
git checkout main
git reset --hard v1.0.0
git push -f origin main # cuidado, somente se for intencional

Restaurar imagens (do registry):

editar docker-compose para usar v1.0.0 ou ter um override
docker compose pull
docker compose up -d

Restaurar banco (se necessário):

PGPASSWORD=postgres123 pg_restore -U postgres -h localhost -p 5432 -d login_db ./backups/login_db_2025-11-22.dump

#### Resumo rápido — checklist para salvar um snapshot seguro

git commit + git tag -a vX.Y.Z + git push && git push --tags

docker tag e docker push das imagens para registry

pg_dump do banco e salvar em backups seguros

Capturar imagens locais em docker save (opcional)

Criar scripts de deploy/restore e automatizar com CI
