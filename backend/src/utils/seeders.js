import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "../config/database.js";

/**
 * Cria usuário admin inicial
 */
export const seedAdminUser = async () => {
    try {
        console.log("👑 Criando usuário admin...");

        // Verificar se admin já existe
        const existingAdmin = await query("SELECT id FROM users WHERE email = 'admin@empresa.com'");

        if (existingAdmin.rows.length > 0) {
            console.log("⏭️  Admin já existe, pulando...");
            return existingAdmin.rows[0].id;
        }

        // Criar admin
        const hashedPassword = await bcrypt.hash("Admin@123", 10);
        const result = await query(
            `INSERT INTO users (email, password, name, role, is_active, email_verified) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
            ["admin@empresa.com", hashedPassword, "Administrador", "admin", true, true]
        );

        console.log("✅ Usuário admin criado: admin@empresa.com / Admin@123");
        return result.rows[0].id;
    } catch (error) {
        console.error("❌ Erro ao criar admin:", error.message);
        return null;
    }
};

/**
 * Cria códigos de convite iniciais
 */
export const seedInviteCodes = async (adminId) => {
    try {
        console.log("🎫 Criando códigos de convite...");

        const codes = [
            { code: "EMPRESA2024", max_uses: 10 },
            { code: "COLABORADOR01", max_uses: 1 },
            { code: "TESTE123", max_uses: 5 },
        ];

        for (const codeData of codes) {
            const existing = await query("SELECT id FROM invite_codes WHERE code = $1", [codeData.code]);

            if (existing.rows.length > 0) {
                console.log(`⏭️  Código ${codeData.code} já existe, pulando...`);
                continue;
            }

            await query(
                `INSERT INTO invite_codes (code, created_by, max_uses, expires_at) 
         VALUES ($1, $2, $3, NOW() + INTERVAL '30 days')`,
                [codeData.code, adminId, codeData.max_uses]
            );

            console.log(`✅ Código criado: ${codeData.code} (${codeData.max_uses} usos)`);
        }
    } catch (error) {
        console.error("❌ Erro ao criar códigos:", error.message);
    }
};

/**
 * Cria usuários de teste
 */
export const seedUsers = async () => {
    console.log("🌱 Iniciando seeder...");

    // Criar admin primeiro
    const adminId = await seedAdminUser();

    if (adminId) {
        // Criar códigos de convite
        await seedInviteCodes(adminId);
    }

    console.log("✅ Seeder finalizado com sucesso!");
};
