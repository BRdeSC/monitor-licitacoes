import { PrismaClient, MatchStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class LicitacoesService {
  /**
   * Busca licitações combinadas (matches) estritamente para o tenant logado,
   * com suporte a filtros geográficos avançados (multi-UF e municípios) e revalidação de termos.
   */
  static async listarMatches(
    tenantId: string,
    filtros: {
      status?: MatchStatus;
      ufs?: string[];
      municipios?: string[];
      buscaTextual?: string;
      pagina?: number;
      limite?: number;
    }
  ) {
    const pagina = Math.max(1, filtros.pagina || 1);
    const limite = Math.max(1, Math.min(100, filtros.limite || 20));
    const skip = (pagina - 1) * limite;

    // Carrega termos de exclusão ativos para revalidação estrita
    const termosExclusao = await prisma.termoExclusao.findMany({
      where: { tenantId, ativo: true },
      select: { termo: true },
    });

    const whereCondition: any = {
      tenantId,
    };

    if (filtros.status) {
      whereCondition.status = filtros.status;
    }

    const licitacaoWhere: any = {};

    // 1. Filtro avançado por Múltiplas UFs
    if (filtros.ufs && filtros.ufs.length > 0) {
      licitacaoWhere.uf = {
        in: filtros.ufs.map((u) => u.trim().toUpperCase()),
      };
    }

    // 2. Filtro avançado por Múltiplos Municípios
    if (filtros.municipios && filtros.municipios.length > 0) {
      licitacaoWhere.municipio = {
        in: filtros.municipios.map((m) => m.trim()),
        mode: 'insensitive',
      };
    }

    // 3. Busca textual por Objeto, Órgão ou Município
    if (filtros.buscaTextual && filtros.buscaTextual.trim() !== '') {
      const termoBusca = filtros.buscaTextual.trim();
      licitacaoWhere.OR = [
        { objetoCompra: { contains: termoBusca, mode: 'insensitive' } },
        { orgaoRazaoSocial: { contains: termoBusca, mode: 'insensitive' } },
        { municipio: { contains: termoBusca, mode: 'insensitive' } },
      ];
    }

    // 4. Revalidação contra termos de exclusão ativos do tenant
    if (termosExclusao.length > 0) {
      const AND = licitacaoWhere.AND || [];
      termosExclusao.forEach((exclusao) => {
        AND.push({
          objetoCompra: {
            not: {
              contains: exclusao.termo,
              mode: 'insensitive',
            },
          },
        });
      });
      licitacaoWhere.AND = AND;
    }

    if (Object.keys(licitacaoWhere).length > 0) {
      whereCondition.licitacao = licitacaoWhere;
    }

    const [total, matches] = await Promise.all([
      prisma.licitacaoMatch.count({ where: whereCondition }),
      prisma.licitacaoMatch.findMany({
        where: whereCondition,
        include: {
          licitacao: true,
        },
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limite,
      }),
    ]);

    return {
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite) || 1,
      matches,
    };
  }

  /**
   * Obtém a lista distinta de municípios disponíveis no banco de dados para filtro dinâmico
   */
  static async obterMunicipiosPorUf(uf?: string) {
    const where: any = {};
    if (uf && uf.trim() !== '') {
      where.uf = uf.trim().toUpperCase();
    }

    const resultados = await prisma.licitacao.findMany({
      where,
      select: {
        municipio: true,
        uf: true,
      },
      distinct: ['municipio', 'uf'],
      orderBy: { municipio: 'asc' },
    });

    const municipios = Array.from(
      new Set(
        resultados
          .map((r) => r.municipio)
          .filter((m): m is string => Boolean(m && m.trim() !== '' && m !== 'Município Não Informado'))
      )
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    return { municipios };
  }

  /**
   * Atualiza o status do edital no funil do tenant (NOVA -> EM_ANALISE -> SALVA / DESCARTADA)
   */
  static async atualizarStatusMatch(
    tenantId: string,
    matchId: string,
    novoStatus: MatchStatus,
    anotacoes?: string
  ) {
    const match = await prisma.licitacaoMatch.findFirst({
      where: { id: matchId, tenantId },
    });

    if (!match) {
      throw new Error('Oportunidade não encontrada ou não pertence a este inquilino.');
    }

    return prisma.licitacaoMatch.update({
      where: { id: matchId },
      data: {
        status: novoStatus,
        anotacoes: anotacoes !== undefined ? anotacoes : match.anotacoes,
      },
      include: {
        licitacao: true,
      },
    });
  }

  /**
   * Estatísticas resumidas do funil do tenant
   */
  static async obterMetricasFunil(tenantId: string) {
    const contadores = await prisma.licitacaoMatch.groupBy({
      by: ['status'],
      where: { tenantId },
      _count: { _all: true },
    });

    const resultado: Record<MatchStatus | 'TOTAL', number> = {
      NOVA: 0,
      EM_ANALISE: 0,
      SALVA: 0,
      DESCARTADA: 0,
      TOTAL: 0,
    };

    contadores.forEach((item: { status: MatchStatus; _count: { _all: number } }) => {
      resultado[item.status] = item._count._all;
      resultado.TOTAL += item._count._all;
    });

    return resultado;
  }
}
