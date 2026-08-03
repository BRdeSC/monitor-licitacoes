import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HealthController {
  static async check(req: Request, res: Response) {
    try {
      // 1. Testa conectividade com o Banco de Dados
      await prisma.$queryRaw`SELECT 1`;

      return res.json({
        status: 'ONLINE',
        timestamp: new Date().toISOString(),
        database: 'CONNECTED',
        uptime: process.uptime(),
      });
    } catch (error: any) {
      return res.status(503).json({
        status: 'DEGRADED',
        timestamp: new Date().toISOString(),
        database: 'DISCONNECTED',
        erro: error.message,
      });
    }
  }
}
