import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axios";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data } = await api.get("/admin/stats");
            setStats(data.data);
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">👑 Painel Admin</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                                {user?.email}
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            >
                                Dashboard Normal
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <Link to="/admin" className="px-3 py-4 border-b-2 border-blue-600 text-blue-600 font-medium">
                            Dashboard
                        </Link>
                        <Link
                            to="/admin/users"
                            className="px-3 py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
                        >
                            Usuários
                        </Link>
                        <Link
                            to="/admin/invite-codes"
                            className="px-3 py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
                        >
                            Códigos de Convite
                        </Link>
                        <Link
                            to="/admin/logs"
                            className="px-3 py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
                        >
                            Logs
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Users */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total de Usuários</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalUsers || 0}</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Active Users */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Usuários Ativos</p>
                                <p className="text-3xl font-bold text-green-600 mt-2">{stats?.activeUsers || 0}</p>
                            </div>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Invite Codes */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Códigos Ativos</p>
                                <p className="text-3xl font-bold text-purple-600 mt-2">{stats?.activeInvites || 0}</p>
                            </div>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-purple-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* New Users (30 days) */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Novos (30 dias)</p>
                                <p className="text-3xl font-bold text-orange-600 mt-2">
                                    {stats?.newUsersLast30Days || 0}
                                </p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <svg
                                    className="w-8 h-8 text-orange-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users by Role */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários por Role</h3>
                        <div className="space-y-4">
                            {stats?.usersByRole?.map((item) => (
                                <div key={item.role} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                item.role === "admin"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {item.role === "admin" ? "👑 Admin" : "👤 User"}
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividades Recentes</h3>
                        <div className="space-y-3">
                            {stats?.recentActivity?.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex items-start space-x-3 text-sm">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-900 font-medium truncate">
                                            {log.user_name || "Sistema"}
                                        </p>
                                        <p className="text-gray-500 truncate">{log.action.replace(/_/g, " ")}</p>
                                        <p className="text-gray-400 text-xs">
                                            {new Date(log.created_at).toLocaleString("pt-BR")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link
                            to="/admin/logs"
                            className="mt-4 block text-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Ver todos os logs →
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/admin/users"
                            className="flex items-center justify-center px-6 py-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                            Gerenciar Usuários
                        </Link>

                        <Link
                            to="/admin/invite-codes"
                            className="flex items-center justify-center px-6 py-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Criar Código de Convite
                        </Link>

                        <Link
                            to="/admin/logs"
                            className="flex items-center justify-center px-6 py-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Ver Logs de Auditoria
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
