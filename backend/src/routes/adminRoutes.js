import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { isAdmin } from "../middleware/checkRole.js";
import {
    listUsers,
    getUserById,
    updateUser,
    deleteUser,
    createInviteCode,
    listInviteCodes,
    deactivateInviteCode,
    getStats,
    getActivityLogs,
} from "../controllers/adminController.js";

const router = express.Router();

// Todas as rotas requerem autenticação + role admin
router.use(verifyToken);
router.use(isAdmin);

// ===== USUÁRIOS =====
router.get("/users", listUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// ===== CÓDIGOS DE CONVITE =====
router.post("/invite-codes", createInviteCode);
router.get("/invite-codes", listInviteCodes);
router.patch("/invite-codes/:id/deactivate", deactivateInviteCode);

// ===== ESTATÍSTICAS =====
router.get("/stats", getStats);

// ===== LOGS =====
router.get("/activity-logs", getActivityLogs);

export default router;
