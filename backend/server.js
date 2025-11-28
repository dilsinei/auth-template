import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initializeDatabase from "./src/utils/initDb.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0"; // IMPORTANTE: Escutar em todas as interfaces

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*",
        credentials: true,
    })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log(`📥 ${req.method} ${req.path}`);
        next();
    });
}

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API placeholder
app.get("/api", (req, res) => {
    res.json({ message: "API de Login - Rodando" });
});

// ===== ROTAS DE AUTENTICAÇÃO =====
app.use("/auth", authRoutes);

// ===== ROTAS DE ADMIN =====
app.use("/admin", adminRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Rota não encontrada",
        path: req.path,
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error("❌ Erro:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Erro interno do servidor",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Inicializar banco de dados
        console.log("🔧 Configurando banco de dados...");
        await initializeDatabase();

        // Iniciar servidor em 0.0.0.0 para aceitar conexões externas
        app.listen(PORT, HOST, () => {
            console.log(`\n✅ Servidor rodando em http://${HOST}:${PORT}`);
            console.log(`📊 Banco de dados: ${process.env.DB_NAME}`);
            console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
            console.log("\n📚 Rotas disponíveis:");
            console.log("  POST   /auth/register - Registrar novo usuário");
            console.log("  POST   /auth/login    - Fazer login");
            console.log("  POST   /auth/refresh  - Renovar token");
            console.log("  GET    /auth/me       - Dados do usuário (protegido)");
            console.log("  POST   /auth/logout   - Logout\n");
        });
    } catch (error) {
        console.error("❌ Erro ao iniciar servidor:", error);
        process.exit(1);
    }
};

// Tratamento de sinais
process.on("SIGTERM", () => {
    console.log("⚠️  SIGTERM recebido, encerrando graciosamente...");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("⚠️  SIGINT recebido, encerrando graciosamente...");
    process.exit(0);
});

// Tratamento de erros não capturados
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection:", reason);
    process.exit(1);
});

startServer();
