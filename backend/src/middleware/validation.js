import validator from "validator";

/**
 * Valida dados de registro
 */
export const validateRegister = (req, res, next) => {
    const { email, password, name } = req.body;
    const errors = [];

    // Validar email
    if (!email) {
        errors.push("Email é obrigatório");
    } else if (!validator.isEmail(email)) {
        errors.push("Email inválido");
    } else if (!validator.isLength(email, { max: 255 })) {
        errors.push("Email muito longo (máx 255 caracteres)");
    }

    // Validar senha
    if (!password) {
        errors.push("Senha é obrigatória");
    } else if (!validator.isLength(password, { min: 8, max: 255 })) {
        errors.push("Senha deve ter entre 8 e 255 caracteres");
    } else if (!/[A-Z]/.test(password)) {
        errors.push("Senha deve conter pelo menos uma letra maiúscula");
    } else if (!/[a-z]/.test(password)) {
        errors.push("Senha deve conter pelo menos uma letra minúscula");
    } else if (!/[0-9]/.test(password)) {
        errors.push("Senha deve conter pelo menos um número");
    } else if (!/[!@#$%^&*]/.test(password)) {
        errors.push("Senha deve conter pelo menos um caractere especial (!@#$%^&*)");
    }

    // Validar nome
    if (!name) {
        errors.push("Nome é obrigatório");
    } else if (!validator.isLength(name, { min: 2, max: 255 })) {
        errors.push("Nome deve ter entre 2 e 255 caracteres");
    } else if (!validator.matches(name, /^[a-zA-Z\s'-]+$/)) {
        errors.push("Nome contém caracteres inválidos");
    }

    // Se houver erros, retornar
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validação falhou",
            errors,
        });
    }

    next();
};

/**
 * Valida dados de login
 */
export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email) {
        errors.push("Email é obrigatório");
    } else if (!validator.isEmail(email)) {
        errors.push("Email inválido");
    }

    if (!password) {
        errors.push("Senha é obrigatória");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validação falhou",
            errors,
        });
    }

    next();
};

/**
 * Sanitiza inputs para evitar XSS
 */
export const sanitizeInput = (req, res, next) => {
    if (req.body.email) {
        req.body.email = validator.trim(req.body.email.toLowerCase());
    }
    if (req.body.name) {
        req.body.name = validator.trim(req.body.name);
    }
    if (req.body.password) {
        req.body.password = validator.trim(req.body.password);
    }

    next();
};
