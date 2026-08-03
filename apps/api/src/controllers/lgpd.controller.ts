import { Request, Response } from 'express';
import { LgpdService } from '../services/lgpd.service';
import { UserRole } from '@prisma/client';

export class LgpdController {
  static async expurgarDadosTenant(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user || user.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({
          erro: 'Apenas Super Administradores podem executar a exclusão definitiva LGPD (Direito ao Esquecimento).',
        });
      }

      const { tenantId } = req.params;
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Desconhecido';

      const resultado = await LgpdService.expurgarTenant(tenantId, user.userId, ip, userAgent);
      return res.json(resultado);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async listarLogsAuditoria(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const logs = await LgpdService.obterAuditLogs(tenantId);
      return res.json(logs);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }
}
