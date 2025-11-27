import { createContext, useState, useEffect, useContext } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Carregar usuário do localStorage ao iniciar
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("accessToken");

            if (storedUser && token) {
                try {
                    setUser(JSON.parse(storedUser));

                    // Validar token buscando dados atualizados
                    const { data } = await api.get("/auth/me");
                    setUser(data.data.user);
                    localStorage.setItem("user", JSON.stringify(data.data.user));
                } catch (error) {
                    console.error("Token inválido:", error);
                    logout();
                }
            }

            setLoading(false);
        };

        loadUser();
    }, []);

    // Login
    const login = async (email, password) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });

            const { user, tokens } = data.data;

            // Salvar no localStorage
            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);
            toast.success("Login realizado com sucesso!");

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Erro ao fazer login";
            toast.error(message);
            return { success: false, message };
        }
    };

    // Registro
    const register = async (name, email, password, inviteCode) => {
        try {
            const { data } = await api.post("/auth/register", {
                name,
                email,
                password,
                inviteCode,
            });

            const { user, tokens } = data.data;

            // Salvar no localStorage
            localStorage.setItem("accessToken", tokens.accessToken);
            localStorage.setItem("refreshToken", tokens.refreshToken);
            localStorage.setItem("user", JSON.stringify(user));

            setUser(user);
            toast.success("Conta criada com sucesso!");

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || "Erro ao registrar";
            const errors = error.response?.data?.errors || [];

            if (errors.length > 0) {
                errors.forEach((err) => toast.error(err));
            } else {
                toast.error(message);
            }

            return { success: false, message, errors };
        }
    };

    // Logout
    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setUser(null);
            toast.info("Logout realizado");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Hook customizado
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider");
    }

    return context;
};

export default AuthContext;
