import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Bem-vindo(a), {user?.name}! 👋</h2>
                    <p className="text-gray-600">
                        Email: <span className="font-medium">{user?.email}</span>
                    </p>
                    <p className="text-gray-600">
                        ID: <span className="font-medium">{user?.id}</span>
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-500 rounded-lg shadow p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Total de Usuários</h3>
                        <p className="text-3xl font-bold">1,234</p>
                    </div>

                    <div className="bg-green-500 rounded-lg shadow p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Transações</h3>
                        <p className="text-3xl font-bold">5,678</p>
                    </div>

                    <div className="bg-purple-500 rounded-lg shadow p-6 text-white">
                        <h3 className="text-lg font-semibold mb-2">Receita</h3>
                        <p className="text-3xl font-bold">R$ 12.4k</p>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        🔐 Sistema de Autenticação Profissional
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                        <li>✅ JWT com Access + Refresh Tokens</li>
                        <li>✅ Proteção contra Brute Force</li>
                        <li>✅ Validação de senha forte</li>
                        <li>✅ Sanitização de inputs</li>
                        <li>✅ Refresh automático de token</li>
                        <li>✅ Logout seguro</li>
                    </ul>
                </div>
            </main>
        </div>
    );
}
