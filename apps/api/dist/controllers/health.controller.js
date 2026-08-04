"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class HealthController {
    static async check(req, res) {
        try {
            // 1. Testa conectividade com o Banco de Dados
            await prisma.$queryRaw `SELECT 1`;
            return res.json({
                status: 'ONLINE',
                timestamp: new Date().toISOString(),
                database: 'CONNECTED',
                uptime: process.uptime(),
            });
        }
        catch (error) {
            return res.status(503).json({
                status: 'DEGRADED',
                timestamp: new Date().toISOString(),
                database: 'DISCONNECTED',
                erro: error.message,
            });
        }
    }
}
exports.HealthController = HealthController;
