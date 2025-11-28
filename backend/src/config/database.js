import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// Criar pool de conexões (melhor performance)
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // máximo de conexões simultâneas
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Event listeners para debugging
pool.on("error", (err) => {
    console.error("❌ Erro inesperado no pool de conexões:", err);
    process.exit(-1);
});

pool.on("connect", () => {
    console.log("✅ Nova conexão estabelecida com PostgreSQL");
});

/**
 * Executa query no banco de dados
 * @param {string} text - Query SQL
 * @param {array} params - Parâmetros da query (para previnir SQL injection)
 */
export const query = async (text, params) => {
    const start = Date.now();

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        console.log("✅ Query executada", { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error("❌ Erro na query:", error.message);
        throw error;
    }
};

/**
 * Testa conexão com banco de dados
 */
export const testConnection = async () => {
    try {
        const result = await query("SELECT NOW()");
        console.log("✅ Conexão com banco de dados bem-sucedida:", result.rows[0]);
        return true;
    } catch (error) {
        console.error("❌ Falha na conexão com banco de dados:", error.message);
        return false;
    }
};

/**
 * Fecha pool de conexões (usar ao encerrar aplicação)
 */
export const closePool = async () => {
    await pool.end();
    console.log("🔌 Pool de conexões fechado");
};

export default pool;
