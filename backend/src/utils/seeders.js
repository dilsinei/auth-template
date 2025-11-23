import bcrypt from "bcryptjs";
import { query } from "../config/database.js";

/**
 * Cria usuários de teste (APENAS DESENVOLVIMENTO)
 */
export const seedUsers = async () => {
    const users = [
        {
            email: "admin@example.com",
            password: "Admin@123",
            name: "Admin User",
        },
        {
            email: "user@example.com",
            password: "User@123",
            name: "Test User",
        },
        {
            email: "developer@example.com",
            password: "Dev@123",
            name: "Developer",
        },
    ];

    try {
        console.log("🌱 Iniciando seeder de usuários...");

        for (const user of users) {
            // Verificar se usuário já existe
            const existingUser = await query("SELECT id FROM users WHERE email = $1", [user.email]);

            if (existingUser.rows.length > 0) {
                console.log(`⏭️  Usuário ${user.email} já existe, pulando...`);
                continue;
            }

            // Hash da senha com salt
            const hashedPassword = await bcrypt.hash(user.password, 10);

            // Inserir usuário
            await query(
                `INSERT INTO users (email, password, name, is_active, email_verified) 
         VALUES ($1, $2, $3, $4, $5)`,
                [user.email, hashedPassword, user.name, true, true]
            );

            console.log(`✅ Usuário criado: ${user.email}`);
        }

        console.log("✅ Seeder finalizado com sucesso!");
        return true;
    } catch (error) {
        console.error("❌ Erro ao fazer seeding:", error.message);
        return false;
    }
};

/**
 * Remove todos os usuários (APENAS DESENVOLVIMENTO)
 */
export const clearUsers = async () => {
    try {
        await query("DELETE FROM users;");
        console.log("⚠️  Todos os usuários foram removidos");
        return true;
    } catch (error) {
        console.error("❌ Erro ao limpar usuários:", error.message);
        return false;
    }
};

/**
 * Lista todos os usuários (sem mostrar senhas)
 */
export const listUsers = async () => {
    try {
        const result = await query("SELECT id, email, name, is_active, created_at FROM users ORDER BY created_at DESC");
        console.log("📋 Usuários no banco:", result.rows);
        return result.rows;
    } catch (error) {
        console.error("❌ Erro ao listar usuários:", error.message);
        return [];
    }
};
