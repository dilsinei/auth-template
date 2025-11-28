import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axios";
import { toast } from "react-toastify";

export default function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        loadLogs();
    }, [page]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/admin/activity-logs", {
                params: { page, limit: 20 },
            });
            setLogs(data.data.logs);
            setPagination(data.data.pagination);
        } catch (error) {
            toast.error("Erro ao carregar logs");
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            user_registered: "👤",
            user_updated: "✏️",
            user_deleted: "🗑️",
            invite_code_created: "🎫",
            login: "🔐",
            logout: "👋",
        };
        return icons[action] || "📝";
    };

    const getActionColor = (action) => {
        if (action.includes("delete")) return "text-red-600 bg-red-50";
        if (action.includes("create") || action.includes("register")) return "text-green-600 bg-green-50";
        if (action.includes("update")) return "text-blue-600 bg-blue-50";
        return "text-gray-600 bg-gray-50";
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Logs de Atividade</h1>
                        <Link to="/admin" className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                            ← Voltar
                        </Link>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <div key={log.id} className="p-6 hover:bg-gray-50 transition">
                                        <div className="flex items-start space-x-4">
                                            {/* Icon */}
                                            <div
                                                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getActionColor(log.action)}`}
                                            >
                                                {getActionIcon(log.action)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {log.user_name || "Sistema"}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{log.user_email}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(log.created_at).toLocaleString("pt-BR")}
                                                    </span>
                                                </div>

                                                <div className="mt-2">
                                                    <span
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}
                                                    >
                                                        {log.action.replace(/_/g, " ").toUpperCase()}
                                                    </span>
                                                </div>

                                                {/* Details */}
                                                {log.details && (
                                                    <details className="mt-3">
                                                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">
                                                            Ver detalhes
                                                        </summary>
                                                        <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-700 overflow-x-auto">
                                                            {JSON.stringify(JSON.parse(log.details), null, 2)}
                                                        </pre>
                                                    </details>
                                                )}

                                                {/* IP and User Agent */}
                                                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                                    {log.ip_address && <span>🌐 IP: {log.ip_address}</span>}
                                                    {log.user_agent && (
                                                        <span className="truncate max-w-md">💻 {log.user_agent}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {logs.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Nenhum log encontrado</p>
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination && pagination.pages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Página {pagination.page} de {pagination.pages} (Total: {pagination.total})
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            disabled={page === 1}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            disabled={page === pagination.pages}
                                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Próxima
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
