import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function auditLogMiddleware(acaoPadrao: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Intercepta a resposta para gravar o log de auditoria
    res.on('finish', async () => {
      // Grava apenas se a requisição teve sucesso ou alteração relevante (2xx / 3xx / 4xx)
      try {
        const tenantId = req.tenantId || req.user?.tenantId || null;
        const userId = req.user?.userId || null;
        const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || 'Desconhecido';

        await prisma.auditLog.create({
          data: {
            tenantId,
            userId,
            acao: acaoPadrao,
            recurso: `${req.method} ${req.originalUrl}`,
            ip,
            userAgent,
            detalhes: {
              statusHttp: res.statusCode,
              params: req.params,
              query: req.query,
            },
          },
        });
      } catch (err) {
        console.error('❌ Erro ao gravar AuditLog LGPD:', err);
      }
    });

    next();
  };
}
