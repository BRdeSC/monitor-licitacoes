import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TermosService {
  // --- TERMOS DE INTERESSE (POSITIVOS) ---
  static async meustermosInteresse(tenantId: string) {
    return prisma.termoInteresse.findMany({
      where: { tenantId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  static async adicionarTermoInteresse(tenantId: string, termo: string, ufs: string[] = []) {
    const termoLimpo = termo.trim().toLowerCase();
    if (!termoLimpo) throw new Error('O termo de interesse não pode ser vazio.');

    return prisma.termoInteresse.create({
      data: {
        tenantId,
        termo: termoLimpo,
        ufs: ufs.map(uf => uf.toUpperCase().trim()),
      },
    });
  }

  static async removerTermoInteresse(tenantId: string, termoId: string) {
    const item = await prisma.termoInteresse.findFirst({
      where: { id: termoId, tenantId },
    });

    if (!item) throw new Error('Termo não encontrado ou não pertence a este tenant.');

    return prisma.termoInteresse.delete({
      where: { id: termoId },
    });
  }

  // --- TERMOS DE EXCLUSÃO (NEGATIVOS) ---
  static async meustermosExclusao(tenantId: string) {
    return prisma.termoExclusao.findMany({
      where: { tenantId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  static async adicionarTermoExclusao(tenantId: string, termo: string) {
    const termoLimpo = termo.trim().toLowerCase();
    if (!termoLimpo) throw new Error('O termo de exclusão não pode ser vazio.');

    return prisma.termoExclusao.create({
      data: {
        tenantId,
        termo: termoLimpo,
      },
    });
  }

  static async removerTermoExclusao(tenantId: string, termoId: string) {
    const item = await prisma.termoExclusao.findFirst({
      where: { id: termoId, tenantId },
    });

    if (!item) throw new Error('Termo não encontrado ou não pertence a este tenant.');

    return prisma.termoExclusao.delete({
      where: { id: termoId },
    });
  }

  static async removerExclusao(tenantId: string, termoId: string) {
    return this.removerTermoExclusao(tenantId, termoId);
  }
}
