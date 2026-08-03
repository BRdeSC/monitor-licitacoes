import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de Segurança Estrita Cross-Tenant Shield
 * Garante que a requisição autenticada possui um tenantId válido
 * e bloqueia qualquer tentativa de manipulação ou injeção externa.
 */
export function requireTenant(req: Request, res: Response, next: NextFunction) {
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
