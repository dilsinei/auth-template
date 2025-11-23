import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import initializeDatabase from "./src/utils/initDb.js";
import { testConnection } from "./src/config/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        database: "checking...",
    });
});

// API placeholder
app.get("/api", (req, res) => {
    res.json({ message: "API de Login - Em desenvolvimento" });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Inicializar banco de dados
        console.log("🔧 Configurando banco de dados...");
        await initializeDatabase();

        // Iniciar servidor
        app.listen(PORT, process.env.HOST || "localhost", () => {
            console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
            console.log(`📊 Banco de dados: ${process.env.DB_NAME}`);
            console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
        });
    } catch (error) {
        console.error("❌ Erro ao iniciar servidor:", error);
        process.exit(1);
    }
};

startServer();
