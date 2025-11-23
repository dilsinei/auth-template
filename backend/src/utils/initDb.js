import { testConnection } from "../config/database.js";
import { runMigrations } from "./migrations.js";
import { seedUsers } from "./seeders.js";

/**
 * Inicializa banco de dados (migrations + seeders)
 */
export const initializeDatabase = async () => {
    console.log("🚀 Iniciando setup do banco de dados...\n");

    // 1. Testar conexão
    console.log("1️⃣  Testando conexão com PostgreSQL...");
    const connected = await testConnection();
    if (!connected) {
        console.error("❌ Não foi possível conectar ao banco de dados");
        process.exit(1);
    }

    // 2. Executar migrations
    console.log("\n2️⃣  Executando migrations...");
    await runMigrations();

    // 3. Popular com dados de teste
    console.log("\n3️⃣  Populando banco com usuários de teste...");
    await seedUsers();

    console.log("\n✅ Setup do banco de dados concluído com sucesso!");
};

export default initializeDatabase;
