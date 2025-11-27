/**
 * Middleware para verificar se usuário é admin
 */
export const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Não autenticado",
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Acesso negado. Apenas administradores.",
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erro ao verificar permissões",
        });
    }
};

/**
 * Middleware para verificar múltiplos roles
 */
export const hasRole = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Não autenticado",
                });
            }

            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Acesso negado. Permissão insuficiente.",
                });
            }

            next();
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erro ao verificar permissões",
            });
        }
    };
};
