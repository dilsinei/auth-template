import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Páginas públicas
import Login from "./pages/Login";
import Register from "./pages/Register";

// Páginas protegidas
import Dashboard from "./pages/Dashboard";

// Páginas admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import InviteCodes from "./pages/admin/InviteCodes";
import ActivityLogs from "./pages/admin/ActivityLogs";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Redirecionar / para /login */}
                    <Route path="/" element={<Navigate to="/login" replace />} />

                    {/* Rotas públicas */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Rotas protegidas (usuário normal) */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Rotas admin (requer role admin) */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/users"
                        element={
                            <AdminRoute>
                                <UsersManagement />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/invite-codes"
                        element={
                            <AdminRoute>
                                <InviteCodes />
                            </AdminRoute>
                        }
                    />

                    <Route
                        path="/admin/logs"
                        element={
                            <AdminRoute>
                                <ActivityLogs />
                            </AdminRoute>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>

                {/* Toast notifications */}
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
