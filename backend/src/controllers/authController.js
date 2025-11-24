import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { query } from "../config/database.js";

dotenv.config();

/**
 * Gera tokens JWT (access + refresh)
 */
const generateTokens = (userId, email) => {
    // Access token: expira em 15 minutos (curta vida)
    const accessToken = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || "15m",
    });

    // Refresh token: expira em 7 dias (longa vida)
    const refreshToken = jwt.sign({ userId, email }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
    });

    return { accessToken, refreshToken };
};

/**
 * POST /auth/register
 * Cria novo usuário
 */
export const register = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        // Verificar se usuário já existe
        const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email já cadastrado",
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir usuário no banco
        const result = await query(
            `INSERT INTO users (email, password, name, is_active) 
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, created_at`,
            [email, hashedPassword, name, true]
        );

        const user = result.rows[0];

        // Gerar tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.email);

        // Armazenar refresh token no banco (opcional, para controle)
        // await query(
        //   'UPDATE users SET refresh_token = $1 WHERE id = $2',
        //   [refreshToken, user.id]
        // );

        return res.status(201).json({
            success: true,
            message: "Usuário registrado com sucesso",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    } catch (error) {
        console.error("❌ Erro ao registrar:", error.message);

        res.status(500).json({
            success: false,
            message: "Erro ao registrar usuário",
        });
    }
};

/**
 * POST /auth/login
 * Autentica usuário
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuário por email
        const result = await query(
            "SELECT id, email, name, password, is_active, locked_until FROM users WHERE email = $1",
            [email]
        );

        // Usuário não encontrado
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos",
            });
        }

        const user = result.rows[0];

        // Verificar se usuário está ativo
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: "Usuário inativo",
            });
        }

        // Verificar se conta está bloqueada (proteção contra brute force)
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
            return res.status(429).json({
                success: false,
                message: "Conta bloqueada temporariamente. Tente novamente mais tarde.",
            });
        }

        // Comparar senhas
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Incrementar tentativas de login falhadas
            await query("UPDATE users SET login_attempts = login_attempts + 1 WHERE id = $1", [user.id]);

            // Se 5+ tentativas, bloquear por 30 minutos
            const updatedUser = await query("SELECT login_attempts FROM users WHERE id = $1", [user.id]);

            if (updatedUser.rows[0].login_attempts >= 5) {
                const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos
                await query("UPDATE users SET locked_until = $1 WHERE id = $2", [lockedUntil, user.id]);

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

        // Reset login_attempts após login bem-sucedido
        await query(
            `UPDATE users 
       SET login_attempts = 0, locked_until = NULL, last_login = NOW()
       WHERE id = $1`,
            [user.id]
        );

        // Gerar tokens
        const { accessToken, refreshToken } = generateTokens(user.id, user.email);

        return res.status(200).json({
            success: true,
            message: "Login realizado com sucesso",
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    } catch (error) {
        console.error("❌ Erro ao fazer login:", error.message);

        res.status(500).json({
            success: false,
            message: "Erro ao realizar login",
        });
    }
};

/**
 * POST /auth/refresh
 * Renova access token usando refresh token
 */
export const refreshAccessToken = async (req, res) => {
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

        // Gerar novo access token
        const accessToken = jwt.sign({ userId: decoded.userId, email: decoded.email }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRATION || "15m",
        });

        return res.status(200).json({
            success: true,
            message: "Token renovado com sucesso",
            data: {
                accessToken,
            },
        });
    } catch (error) {
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
    try {
        const { userId } = req.user;

        const result = await query(
            "SELECT id, email, name, is_active, email_verified, created_at FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: result.rows[0],
            },
        });
    } catch (error) {
        console.error("❌ Erro ao buscar usuário:", error.message);

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
    // JWT é stateless, então logout é apenas instruir o cliente a remover tokens
    res.status(200).json({
        success: true,
        message: "Logout realizado com sucesso",
    });
};
