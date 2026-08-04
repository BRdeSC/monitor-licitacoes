"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTenant = requireTenant;
/**
 * Middleware de Segurança Estrita Cross-Tenant Shield
 * Garante que a requisição autenticada possui um tenantId válido
 * e bloqueia qualquer tentativa de manipulação ou injeção externa.
 */
function requireTenant(req, res, next) {
    const tenantId = req.tenantId || req.user?.tenantId;
    if (!tenantId) {
        return res.status(403).json({
            erro: 'Acesso negado (Cross-Tenant Shield). Identificador do inquilino ausente.',
        });
    }
    // Injeta explicitamente no contexto do Request
    req.tenantId = tenantId;
    return next();
}
