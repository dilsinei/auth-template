import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/axios";
import { toast } from "react-toastify";

export default function InviteCodes() {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCode, setNewCode] = useState({
        max_uses: 1,
        expires_in_days: 30,
    });

    useEffect(() => {
        loadCodes();
    }, []);

    const loadCodes = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/admin/invite-codes");
            setCodes(data.data.inviteCodes);
        } catch (error) {
            toast.error("Erro ao carregar códigos");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCode = async () => {
        try {
            await api.post("/admin/invite-codes", newCode);
            toast.success("Código criado com sucesso!");
            setShowCreateModal(false);
            setNewCode({ max_uses: 1, expires_in_days: 30 });
            loadCodes();
        } catch (error) {
            toast.error("Erro ao criar código");
        }
    };

    const handleDeactivate = async (id, code) => {
        if (!window.confirm(`Desativar código ${code}?`)) return;

        try {
            await api.patch(`/admin/invite-codes/${id}/deactivate`);
            toast.success("Código desativado");
            loadCodes();
        } catch (error) {
            toast.error("Erro ao desativar código");
        }
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        toast.success("Código copiado!");
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Códigos de Convite</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                + Novo Código
                            </button>
                            <Link
                                to="/admin"
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                            >
                                ← Voltar
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Código
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usos
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expira em
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Criado por
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {codes.map((code) => {
                                        const isExpired = new Date(code.expires_at) < new Date();
                                        const isExhausted = code.current_uses >= code.max_uses;
                                        const isActive = code.is_active && !isExpired && !isExhausted;

                                        return (
                                            <tr key={code.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <code className="px-3 py-1 bg-gray-100 rounded font-mono text-sm font-semibold">
                                                            {code.code}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(code.code)}
                                                            className="text-gray-400 hover:text-gray-600"
                                                            title="Copiar"
                                                        >
                                                            <svg
                                                                className="w-5 h-5"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {code.current_uses} / {code.max_uses}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className={`h-2 rounded-full ${
                                                                isExhausted ? "bg-red-500" : "bg-blue-500"
                                                            }`}
                                                            style={{
                                                                width: `${(code.current_uses / code.max_uses) * 100}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                            isActive
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}
                                                    >
                                                        {isActive
                                                            ? "Ativo"
                                                            : isExpired
                                                              ? "Expirado"
                                                              : isExhausted
                                                                ? "Esgotado"
                                                                : "Inativo"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(code.expires_at).toLocaleDateString("pt-BR")}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {code.creator_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {code.is_active && (
                                                        <button
                                                            onClick={() => handleDeactivate(code.id, code.code)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Desativar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {codes.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Nenhum código criado ainda</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Criar Código de Convite</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número máximo de usos
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={newCode.max_uses}
                                    onChange={(e) => setNewCode({ ...newCode, max_uses: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Quantas pessoas podem usar este código</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expira em (dias)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={newCode.expires_in_days}
                                    onChange={(e) =>
                                        setNewCode({ ...newCode, expires_in_days: parseInt(e.target.value) })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Data de expiração:{" "}
                                    {new Date(
                                        Date.now() + newCode.expires_in_days * 24 * 60 * 60 * 1000
                                    ).toLocaleDateString("pt-BR")}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setNewCode({ max_uses: 1, expires_in_days: 30 });
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateCode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Criar Código
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
