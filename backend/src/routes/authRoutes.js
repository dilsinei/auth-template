import express from "express";
import { register, login, logout, refreshAccessToken, getMe } from "../controllers/authController.js";
import { verifyToken } from "../middleware/auth.js";
import { validateRegister, validateLogin, sanitizeInput } from "../middleware/validation.js";

const router = express.Router();

/**
 * POST /auth/register
 * Registra novo usuário
 * Body: { email, password, name }
 */
router.post("/register", sanitizeInput, validateRegister, register);

/**
 * POST /auth/login
 * Autentica usuário
 * Body: { email, password }
 */
router.post("/login", sanitizeInput, validateLogin, login);

/**
 * POST /auth/refresh
 * Renova access token
 * Body: { refreshToken }
 */
router.post("/refresh", refreshAccessToken);

/**
 * POST /auth/logout
 * Realiza logout
 */
router.post("/logout", verifyToken, logout);

/**
 * GET /auth/me
 * Retorna dados do usuário autenticado (requer JWT)
 * Headers: Authorization: Bearer <token>
 */
router.get("/me", verifyToken, getMe);

export default router;
