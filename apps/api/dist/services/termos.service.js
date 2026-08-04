"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermosService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TermosService {
    // --- TERMOS DE INTERESSE (POSITIVOS) ---
    static async meustermosInteresse(tenantId) {
        return prisma.termoInteresse.findMany({
            where: { tenantId },
            orderBy: { criadoEm: 'desc' },
        });
    }
    static async adicionarTermoInteresse(tenantId, termo, ufs = []) {
        const termoLimpo = termo.trim().toLowerCase();
        if (!termoLimpo)
            throw new Error('O termo de interesse não pode ser vazio.');
        return prisma.termoInteresse.create({
            data: {
                tenantId,
                termo: termoLimpo,
                ufs: ufs.map(uf => uf.toUpperCase().trim()),
            },
        });
    }
    static async removerTermoInteresse(tenantId, termoId) {
        const item = await prisma.termoInteresse.findFirst({
            where: { id: termoId, tenantId },
        });
        if (!item)
            throw new Error('Termo não encontrado ou não pertence a este tenant.');
        return prisma.termoInteresse.delete({
            where: { id: termoId },
        });
    }
    // --- TERMOS DE EXCLUSÃO (NEGATIVOS) ---
    static async meustermosExclusao(tenantId) {
        return prisma.termoExclusao.findMany({
            where: { tenantId },
            orderBy: { criadoEm: 'desc' },
        });
    }
    static async adicionarTermoExclusao(tenantId, termo) {
        const termoLimpo = termo.trim().toLowerCase();
        if (!termoLimpo)
            throw new Error('O termo de exclusão não pode ser vazio.');
        return prisma.termoExclusao.create({
            data: {
                tenantId,
                termo: termoLimpo,
            },
        });
    }
    static async removerTermoExclusao(tenantId, termoId) {
        const item = await prisma.termoExclusao.findFirst({
            where: { id: termoId, tenantId },
        });
        if (!item)
            throw new Error('Termo não encontrado ou não pertence a este tenant.');
        return prisma.termoExclusao.delete({
            where: { id: termoId },
        });
    }
    static async removerExclusao(tenantId, termoId) {
        return this.removerTermoExclusao(tenantId, termoId);
    }
}
exports.TermosService = TermosService;
