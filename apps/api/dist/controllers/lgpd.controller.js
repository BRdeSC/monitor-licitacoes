"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgpdController = void 0;
const lgpd_service_1 = require("../services/lgpd.service");
const client_1 = require("@prisma/client");
class LgpdController {
    static async expurgarDadosTenant(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== client_1.UserRole.SUPER_ADMIN) {
                return res.status(403).json({
                    erro: 'Apenas Super Administradores podem executar a exclusão definitiva LGPD (Direito ao Esquecimento).',
                });
            }
            const { tenantId } = req.params;
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
            const userAgent = req.headers['user-agent'] || 'Desconhecido';
            const resultado = await lgpd_service_1.LgpdService.expurgarTenant(tenantId, user.userId, ip, userAgent);
            return res.json(resultado);
        }
        catch (error) {
            return res.status(400).json({ erro: error.message });
        }
    }
    static async listarLogsAuditoria(req, res) {
        try {
            const tenantId = req.tenantId;
            const logs = await lgpd_service_1.LgpdService.obterAuditLogs(tenantId);
            return res.json(logs);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}
exports.LgpdController = LgpdController;
