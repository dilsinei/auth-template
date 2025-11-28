import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Verifica se o token JWT é válido
 */
export const verifyToken = (req, res, next) => {
    try {
        // Extrair token do header: "Bearer token123"
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token não fornecido",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token inválido",
            });
        }

        // Verificar assinatura do token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Adicionar role ao req.user
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role, // ← Adicionar role
        };
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expirado",
                code: "TOKEN_EXPIRED",
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Token inválido",
                code: "INVALID_TOKEN",
            });
        }

        res.status(500).json({
            success: false,
            message: "Erro ao verificar token",
        });
    }
};

/**
 * Middleware opcional: verifica token mas não falha se não existir
 */
export const optionalToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Ignora erros e continua
        next();
    }
};
