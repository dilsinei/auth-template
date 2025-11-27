import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { query } from "../config/database.js";

dotenv.config();

/**
 * Gera tokens JWT (access + refresh) - ATUALIZADO COM ROLE
 */
const generateTokens = (userId, email, role) => {
    // Access token: expira em 15 minutos (curta vida)
    const accessToken = jwt.sign(
        { userId, email, role }, // ✅ Incluir role
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "15m" }
    );

    // Refresh token: expira em 7 dias (longa vida)
    const refreshToken = jwt.sign(
        { userId, email, role }, // ✅ Incluir role
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d" }
    );

    return { accessToken, refreshToken };
};

/**
 * POST /auth/register
 * Cria novo usuário (REQUER CÓDIGO DE CONVITE)
 */
export const register = async (req, res) => {
    console.log("📥 Register request recebido:", { email: req.body.email, name: req.body.name });
    const { email, password, name, inviteCode } = req.body;

    try {
        // ✅ VERIFICAR CÓDIGO DE CONVITE
        if (!inviteCode) {
            return res.status(400).json({
                success: false,
                message: "Código de convite é obrigatório",
            });
        }

        console.log("🎫 Verificando código de convite:", inviteCode);
        const inviteResult = await query(
            `SELECT * FROM invite_codes 
       WHERE code = $1 AND is_active = true`,
            [inviteCode]
        );

        if (inviteResult.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Código de convite inválido",
            });
        }

        const invite = inviteResult.rows[0];

        // Verificar expiração
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Código de convite expirado",
            });
        }

        // Verificar usos
        if (invite.current_uses >= invite.max_uses) {
            return res.status(400).json({
                success: false,
                message: "Código de convite já foi totalmente utilizado",
            });
        }

        // Verificar se usuário já existe
        console.log("🔍 Verificando se usuário existe...");
        const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            console.log("⚠️  Email já cadastrado:", email);
            return res.status(409).json({
                success: false,
                message: "Email já cadastrado",
            });
        }

        // Hash da senha
        console.log("🔐 Fazendo hash da senha...");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir usuário no banco
        console.log("💾 Inserindo usuário no banco...");
        const result = await query(
            `INSERT INTO users (email, password, name, is_active, invite_code_used, role) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name, role, created_at`,
            [email, hashedPassword, name, true, inviteCode, "user"]
        );

        const user = result.rows[0];
        console.log("✅ Usuário criado:", user.id);

        // Incrementar uso do código
        await query("UPDATE invite_codes SET current_uses = current_uses + 1 WHERE code = $1", [inviteCode]);

        // Registrar log
        await query(
            `INSERT INTO activity_logs (user_id, action, details, ip_address) 
       VALUES ($1, $2, $3, $4)`,
            [
                user.id,
                "user_registered",
                JSON.stringify({ email, invite_code: inviteCode }),
                req.ip || req.headers["x-forwarded-for"] || "unknown",
            ]
        );

        // Gerar tokens
        console.log("🎫 Gerando tokens...");
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

        console.log("✅ Register completo para:", email);
        return res.status(201).json({
            success: true,
            message: "Usuário registrado com sucesso",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    } catch (error) {
        console.error("❌ Erro ao registrar:", error);

        res.status(500).json({
            success: false,
            message: "Erro ao registrar usuário",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * POST /auth/login
 * Autentica usuário
 */
export const login = async (req, res) => {
    console.log("📥 Login request recebido:", { email: req.body.email });
    const { email, password } = req.body;

    try {
        // Buscar usuário por email (INCLUIR ROLE)
        console.log("🔍 Buscando usuário:", email);
        const result = await query(
            "SELECT id, email, name, password, is_active, locked_until, role FROM users WHERE email = $1",
            [email]
        );

        // Usuário não encontrado
        if (result.rows.length === 0) {
            console.log("⚠️  Usuário não encontrado:", email);
            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos",
            });
        }

        const user = result.rows[0];
        console.log("✅ Usuário encontrado:", user.id);

        // Verificar se usuário está ativo
        if (!user.is_active) {
            console.log("⚠️  Usuário inativo:", email);
            return res.status(403).json({
                success: false,
                message: "Usuário inativo",
            });
        }

        // Verificar se conta está bloqueada (proteção contra brute force)
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            console.log("🔒 Conta bloqueada até:", user.locked_until);
            return res.status(429).json({
                success: false,
                message: "Conta bloqueada temporariamente. Tente novamente mais tarde.",
            });
        }

        // Comparar senhas
        console.log("🔐 Verificando senha...");
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log("❌ Senha incorreta para:", email);
            // Incrementar tentativas de login falhadas
            await query("UPDATE users SET login_attempts = login_attempts + 1 WHERE id = $1", [user.id]);

            // Se 5+ tentativas, bloquear por 30 minutos
            const updatedUser = await query("SELECT login_attempts FROM users WHERE id = $1", [user.id]);

            if (updatedUser.rows[0].login_attempts >= 5) {
                const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
                await query("UPDATE users SET locked_until = $1 WHERE id = $2", [lockedUntil, user.id]);

                console.log("🔒 Conta bloqueada por tentativas excessivas:", email);
                return res.status(429).json({
                    success: false,
                    message: "Muitas tentativas de login. Tente novamente em 30 minutos.",
                });
            }

            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos",
            });
        }

        console.log("✅ Senha válida");

        // Reset login_attempts após login bem-sucedido
        await query(
            `UPDATE users 
       SET login_attempts = 0, locked_until = NULL, last_login = NOW()
       WHERE id = $1`,
            [user.id]
        );

        // Gerar tokens COM ROLE
        console.log("🎫 Gerando tokens...");
        const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

        console.log("✅ Login completo para:", email);
        return res.status(200).json({
            success: true,
            message: "Login realizado com sucesso",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    } catch (error) {
        console.error("❌ Erro ao fazer login:", error);

        res.status(500).json({
            success: false,
            message: "Erro ao realizar login",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

/**
 * POST /auth/refresh
 * Renova access token usando refresh token
 */
export const refreshAccessToken = async (req, res) => {
    console.log("📥 Refresh token request recebido");
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: "Refresh token não fornecido",
        });
    }

    try {
        // Verificar refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Gerar novo access token COM ROLE
        const accessToken = jwt.sign(
            { userId: decoded.userId, email: decoded.email, role: decoded.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION || "15m" }
        );

        console.log("✅ Token renovado para:", decoded.email);
        return res.status(200).json({
            success: true,
            message: "Token renovado com sucesso",
            data: {
                accessToken,
            },
        });
    } catch (error) {
        console.error("❌ Erro ao renovar token:", error.message);
        return res.status(401).json({
            success: false,
            message: "Refresh token inválido ou expirado",
            code: "INVALID_REFRESH_TOKEN",
        });
    }
};

/**
 * GET /auth/me
 * Retorna dados do usuário autenticado
 */
export const getMe = async (req, res) => {
    console.log("📥 GetMe request recebido para userId:", req.user.userId);

    try {
        const { userId } = req.user;

        const result = await query(
            "SELECT id, email, name, role, is_active, email_verified, created_at FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            console.log("⚠️  Usuário não encontrado:", userId);
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        }

        console.log("✅ Dados retornados para:", result.rows[0].email);
        res.status(200).json({
            success: true,
            data: {
                user: result.rows[0],
            },
        });
    } catch (error) {
        console.error("❌ Erro ao buscar usuário:", error);

        res.status(500).json({
            success: false,
            message: "Erro ao buscar dados do usuário",
        });
    }
};

/**
 * POST /auth/logout
 * Realiza logout (cliente remove token)
 */
export const logout = (req, res) => {
    console.log("📥 Logout request recebido para:", req.user.email);

    // JWT é stateless, então logout é apenas instruir o cliente a remover tokens
    res.status(200).json({
        success: false,
        message: "Logout realizado com sucesso",
    });
};
