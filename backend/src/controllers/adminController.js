import bcrypt from "bcryptjs";
import crypto from "crypto";
import { query } from "../config/database.js";

/**
 * GET /admin/users
 * Lista todos os usuários (apenas admin)
 */
export const listUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", role = "" } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = "WHERE 1=1";
        const params = [];
        let paramCount = 0;

        // Filtro de busca
        if (search) {
            paramCount++;
            whereClause += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        // Filtro de role
        if (role) {
            paramCount++;
            whereClause += ` AND role = $${paramCount}`;
            params.push(role);
        }

        // Buscar usuários
        const usersQuery = `
      SELECT 
        id, email, name, role, is_active, email_verified,
        last_login, created_at, invite_code_used
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
        params.push(limit, offset);

        const usersResult = await query(usersQuery, params);

        // Contar total
        const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
        const countResult = await query(countQuery, params.slice(0, paramCount));
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            data: {
                users: usersResult.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("❌ Erro ao listar usuários:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao listar usuários",
        });
    }
};

/**
 * GET /admin/users/:id
 * Busca usuário por ID
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT 
        id, email, name, role, is_active, email_verified,
        last_login, created_at, updated_at, invite_code_used,
        login_attempts, locked_until
      FROM users
      WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        }

        res.json({
            success: true,
            data: { user: result.rows[0] },
        });
    } catch (error) {
        console.error("❌ Erro ao buscar usuário:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar usuário",
        });
    }
};

/**
 * PATCH /admin/users/:id
 * Atualiza usuário
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, is_active } = req.body;

        // Não permitir admin editar a si mesmo (prevenção)
        if (parseInt(id) === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: "Você não pode editar seu próprio usuário",
            });
        }

        const updates = [];
        const params = [];
        let paramCount = 0;

        if (name !== undefined) {
            paramCount++;
            updates.push(`name = $${paramCount}`);
            params.push(name);
        }

        if (email !== undefined) {
            paramCount++;
            updates.push(`email = $${paramCount}`);
            params.push(email);
        }

        if (role !== undefined && ["admin", "user"].includes(role)) {
            paramCount++;
            updates.push(`role = $${paramCount}`);
            params.push(role);
        }

        if (is_active !== undefined) {
            paramCount++;
            updates.push(`is_active = $${paramCount}`);
            params.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Nenhum campo para atualizar",
            });
        }

        paramCount++;
        params.push(id);

        const updateQuery = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, email, name, role, is_active
    `;

        const result = await query(updateQuery, params);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        }

        // Registrar log
        await query(
            `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
            [req.user.userId, "user_updated", JSON.stringify({ target_user_id: id, changes: req.body })]
        );

        res.json({
            success: true,
            message: "Usuário atualizado com sucesso",
            data: { user: result.rows[0] },
        });
    } catch (error) {
        console.error("❌ Erro ao atualizar usuário:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao atualizar usuário",
        });
    }
};

/**
 * DELETE /admin/users/:id
 * Desativa usuário (soft delete)
 */
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Não permitir admin deletar a si mesmo
        if (parseInt(id) === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: "Você não pode deletar seu próprio usuário",
            });
        }

        const result = await query("UPDATE users SET is_active = false WHERE id = $1 RETURNING id, email", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        }

        // Registrar log
        await query(
            `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
            [req.user.userId, "user_deleted", JSON.stringify({ target_user_id: id, email: result.rows[0].email })]
        );

        res.json({
            success: true,
            message: "Usuário desativado com sucesso",
        });
    } catch (error) {
        console.error("❌ Erro ao deletar usuário:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao deletar usuário",
        });
    }
};

/**
 * POST /admin/invite-codes
 * Cria novo código de convite
 */
export const createInviteCode = async (req, res) => {
    try {
        const { max_uses = 1, expires_in_days = 30 } = req.body;

        // Gerar código único
        const code = crypto.randomBytes(4).toString("hex").toUpperCase();

        // Calcular data de expiração
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expires_in_days);

        const result = await query(
            `INSERT INTO invite_codes (code, created_by, max_uses, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [code, req.user.userId, max_uses, expiresAt]
        );

        // Registrar log
        await query(
            `INSERT INTO activity_logs (user_id, action, details) 
       VALUES ($1, $2, $3)`,
            [req.user.userId, "invite_code_created", JSON.stringify({ code, max_uses, expires_at: expiresAt })]
        );

        res.status(201).json({
            success: true,
            message: "Código de convite criado com sucesso",
            data: { inviteCode: result.rows[0] },
        });
    } catch (error) {
        console.error("❌ Erro ao criar código:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao criar código de convite",
        });
    }
};

/**
 * GET /admin/invite-codes
 * Lista códigos de convite
 */
export const listInviteCodes = async (req, res) => {
    try {
        const result = await query(
            `SELECT 
        ic.*,
        u.name as creator_name
      FROM invite_codes ic
      JOIN users u ON ic.created_by = u.id
      ORDER BY ic.created_at DESC`
        );

        res.json({
            success: true,
            data: { inviteCodes: result.rows },
        });
    } catch (error) {
        console.error("❌ Erro ao listar códigos:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao listar códigos de convite",
        });
    }
};

/**
 * PATCH /admin/invite-codes/:id
 * Desativa código de convite
 */
export const deactivateInviteCode = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query("UPDATE invite_codes SET is_active = false WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Código não encontrado",
            });
        }

        res.json({
            success: true,
            message: "Código desativado com sucesso",
        });
    } catch (error) {
        console.error("❌ Erro ao desativar código:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao desativar código",
        });
    }
};

/**
 * GET /admin/stats
 * Estatísticas do sistema
 */
export const getStats = async (req, res) => {
    try {
        // Total de usuários
        const totalUsers = await query("SELECT COUNT(*) FROM users");

        // Usuários ativos
        const activeUsers = await query("SELECT COUNT(*) FROM users WHERE is_active = true");

        // Usuários por role
        const usersByRole = await query("SELECT role, COUNT(*) as count FROM users GROUP BY role");

        // Códigos de convite ativos
        const activeInvites = await query("SELECT COUNT(*) FROM invite_codes WHERE is_active = true");

        // Novos usuários (últimos 30 dias)
        const newUsers = await query("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'");

        // Últimas atividades
        const recentActivity = await query(
            `SELECT 
        al.*,
        u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10`
        );

        res.json({
            success: true,
            data: {
                totalUsers: parseInt(totalUsers.rows[0].count),
                activeUsers: parseInt(activeUsers.rows[0].count),
                usersByRole: usersByRole.rows,
                activeInvites: parseInt(activeInvites.rows[0].count),
                newUsersLast30Days: parseInt(newUsers.rows[0].count),
                recentActivity: recentActivity.rows,
            },
        });
    } catch (error) {
        console.error("❌ Erro ao buscar estatísticas:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar estatísticas",
        });
    }
};

/**
 * GET /admin/activity-logs
 * Lista logs de atividades
 */
export const getActivityLogs = async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const result = await query(
            `SELECT 
        al.*,
        u.name as user_name,
        u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await query("SELECT COUNT(*) FROM activity_logs");
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            data: {
                logs: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("❌ Erro ao buscar logs:", error);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar logs",
        });
    }
};
