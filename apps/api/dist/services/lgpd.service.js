"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LgpdService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class LgpdService {
    /**
     * Executa a exclusão definitiva dos dados de um Tenant (Direito ao Esquecimento - LGPD Art. 18)
     */
    static async expurgarTenant(tenantId, executadoPorUserId, ip, userAgent) {
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            include: { users: true },
        });
        if (!tenant) {
            throw new Error('Tenant não encontrado.');
        }
        // Registra log final de auditoria da remoção antes de apagar
        await prisma.auditLog.create({
            data: {
                tenantId: null,
                userId: executadoPorUserId,
                acao: 'RIGHT_TO_BE_FORGOTTEN_PURGE',
                recurso: `/api/lgpd/forget/${tenantId}`,
                ip,
                userAgent,
                detalhes: {
                    tenantNome: tenant.nome,
                    tenantCnpj: tenant.cnpj,
                    totalUsuariosRemovidos: tenant.users.length,
                    dataExclusao: new Date().toISOString(),
                },
            },
        });
        // Exclusão em cascata (Tenant, Users, Termos, Matches, AuditLogs associados)
        await prisma.tenant.delete({
            where: { id: tenantId },
        });
        return {
            sucesso: true,
            mensagem: `Todos os dados do tenant ${tenant.nome} (${tenant.cnpj}) foram excluídos definitivamente em conformidade com a LGPD.`,
        };
    }
    /**
     * Lista logs de auditoria do tenant para transparência LGPD
     */
    static async obterAuditLogs(tenantId, limite = 50) {
        return prisma.auditLog.findMany({
            where: { tenantId },
            orderBy: { criadoEm: 'desc' },
            take: limite,
            select: {
                id: true,
                acao: true,
                recurso: true,
                ip: true,
                criadoEm: true,
                detalhes: true,
                user: {
                    select: {
                        nome: true,
                        email: true,
                    },
                },
            },
        });
    }
}
exports.LgpdService = LgpdService;
