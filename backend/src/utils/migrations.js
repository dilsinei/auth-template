import { query } from "../config/database.js";

/**
 * Cria tabela de usuários com roles
 */
export const createUsersTable = async () => {
    const createTableQuery = `
    -- Criar ENUM para roles
    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('admin', 'user');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;

    -- Tabela de usuários
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      
      -- Dados básicos
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      
      -- Role e permissões
      role user_role DEFAULT 'user',
      
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
      
      -- Código de convite usado
      invite_code_used VARCHAR(50),
      
      -- Auditoria
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by INT REFERENCES users(id),
      
      -- Índices para performance
      CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
    );

    -- Índices
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

    -- Trigger para updated_at
    CREATE OR REPLACE FUNCTION update_users_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

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
 * Cria tabela de códigos de convite
 */
export const createInviteCodesTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS invite_codes (
      id SERIAL PRIMARY KEY,
      
      -- Código único
      code VARCHAR(50) UNIQUE NOT NULL,
      
      -- Quem criou
      created_by INT NOT NULL REFERENCES users(id),
      
      -- Status
      is_active BOOLEAN DEFAULT true,
      max_uses INT DEFAULT 1,
      current_uses INT DEFAULT 0,
      
      -- Expiração
      expires_at TIMESTAMP,
      
      -- Auditoria
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
    CREATE INDEX IF NOT EXISTS idx_invite_codes_is_active ON invite_codes(is_active);
  `;

    try {
        await query(createTableQuery);
        console.log("✅ Tabela invite_codes criada com sucesso!");
        return true;
    } catch (error) {
        console.error("❌ Erro ao criar tabela invite_codes:", error.message);
        return false;
    }
};

/**
 * Cria tabela de logs de atividades
 */
export const createActivityLogsTable = async () => {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id SERIAL PRIMARY KEY,
      
      -- Usuário que realizou ação
      user_id INT REFERENCES users(id),
      
      -- Tipo de ação
      action VARCHAR(100) NOT NULL,
      
      -- Detalhes
      details JSONB,
      
      -- IP e User Agent
      ip_address VARCHAR(45),
      user_agent TEXT,
      
      -- Timestamp
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
    CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
  `;

    try {
        await query(createTableQuery);
        console.log("✅ Tabela activity_logs criada com sucesso!");
        return true;
    } catch (error) {
        console.error("❌ Erro ao criar tabela activity_logs:", error.message);
        return false;
    }
};

/**
 * Droppa todas as tabelas (apenas para desenvolvimento)
 */
export const dropAllTables = async () => {
    try {
        await query("DROP TABLE IF EXISTS activity_logs CASCADE;");
        await query("DROP TABLE IF EXISTS invite_codes CASCADE;");
        await query("DROP TABLE IF EXISTS users CASCADE;");
        await query("DROP TYPE IF EXISTS user_role CASCADE;");
        console.log("⚠️  Todas as tabelas removidas");
        return true;
    } catch (error) {
        console.error("❌ Erro ao remover tabelas:", error.message);
        return false;
    }
};

/**
 * Executa todas as migrations
 */
export const runMigrations = async () => {
    console.log("🚀 Iniciando migrations...");

    await createUsersTable();
    await createInviteCodesTable();
    await createActivityLogsTable();

    console.log("✅ Todas as migrations executadas com sucesso!");
};
