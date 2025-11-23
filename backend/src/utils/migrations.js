import { query } from "../config/database.js";

/**
 * Cria tabela de usuários com campos de segurança
 */
export const createUsersTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      
      -- Dados básicos
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      
      -- Status
      is_active BOOLEAN DEFAULT true,
      email_verified BOOLEAN DEFAULT false,
      
      -- Segurança
      last_login TIMESTAMP,
      login_attempts INT DEFAULT 0,
      locked_until TIMESTAMP,
      
      -- Tokens para recuperação de senha
      reset_token VARCHAR(500),
      reset_token_expires TIMESTAMP,
      
      -- Auditoria
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      
      -- Índices para performance
      CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
    );

    -- Criar índices para melhor performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

    -- Criar função para atualizar updated_at automaticamente
    CREATE OR REPLACE FUNCTION update_users_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Criar trigger para atualizar updated_at
    DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
    CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();
  `;

    try {
        await query(createTableQuery);
        console.log("✅ Tabela users criada com sucesso!");
        return true;
    } catch (error) {
        console.error("❌ Erro ao criar tabela users:", error.message);
        return false;
    }
};

/**
 * Droppa tabela (apenas para desenvolvimento)
 */
export const dropUsersTable = async () => {
    try {
        await query("DROP TABLE IF EXISTS users CASCADE;");
        console.log("⚠️  Tabela users removida");
        return true;
    } catch (error) {
        console.error("❌ Erro ao remover tabela:", error.message);
        return false;
    }
};

/**
 * Executa todas as migrations
 */
export const runMigrations = async () => {
    console.log("🚀 Iniciando migrations...");
    const success = await createUsersTable();

    if (success) {
        console.log("✅ Todas as migrations executadas com sucesso!");
    } else {
        console.error("❌ Erro ao executar migrations");
        process.exit(1);
    }
};
