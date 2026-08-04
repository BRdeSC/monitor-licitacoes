"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicitacoesService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Cache em memória para municípios do IBGE por UF
const ibgeMunicipiosCache = new Map();
class LicitacoesService {
    /**
     * Busca licitações combinadas (matches) estritamente para o tenant logado.
     * Regra de Negócio & Isolamento Estrito:
     * 1. Se o Tenant ativo NÃO possuir palavras-chave ativas, expurga matches antigos do tenant e retorna 0 resultados.
     * 2. Se houver palavras ativas, PURGA matches obsoletos cujos termos foram removidos/desativados e traz estritamente correspondências ativas.
     */
    static async listarMatches(tenantId, filtros) {
        const pagina = Math.max(1, filtros.pagina || 1);
        const limite = Math.max(1, Math.min(100, filtros.limite || 20));
        const skip = (pagina - 1) * limite;
        // 1. Carrega termos de interesse ATIVOS do tenant
        const termosAtivos = await prisma.termoInteresse.findMany({
            where: { tenantId, ativo: true },
            select: { termo: true },
        });
        const listaTermosAtivos = termosAtivos.map((t) => t.termo);
        // Se o tenant NÃO tiver termos de interesse ativos: expurga matches antigos e retorna 0
        if (listaTermosAtivos.length === 0) {
            await prisma.licitacaoMatch.deleteMany({
                where: { tenantId },
            });
            return {
                total: 0,
                pagina,
                limite,
                totalPaginas: 1,
                matches: [],
            };
        }
        // 2. Expurgo defensivo de matches obsoletos cujos termos foram deletados pelo tenant
        const matchesTenant = await prisma.licitacaoMatch.findMany({
            where: { tenantId },
            select: { id: true, termosCorrespondentes: true },
        });
        const idsParaDeletar = matchesTenant
            .filter((m) => {
            const temAoMenosUmTermoAtivo = m.termosCorrespondentes.some((tc) => listaTermosAtivos.some((ta) => ta.toLowerCase() === tc.toLowerCase()));
            return !temAoMenosUmTermoAtivo;
        })
            .map((m) => m.id);
        if (idsParaDeletar.length > 0) {
            await prisma.licitacaoMatch.deleteMany({
                where: { id: { in: idsParaDeletar } },
            });
        }
        // 3. Carrega termos de exclusão ativos para revalidação estrita
        const termosExclusao = await prisma.termoExclusao.findMany({
            where: { tenantId, ativo: true },
            select: { termo: true },
        });
        // Condição base: pertence ao tenant E possui ao menos 1 termo correspondente ativo
        const whereCondition = {
            tenantId,
            termosCorrespondentes: {
                hasSome: listaTermosAtivos,
            },
        };
        if (filtros.status) {
            whereCondition.status = filtros.status;
        }
        const licitacaoWhere = {};
        // Filtro por Tipo de Documento (Abas: Edital, Ata, Contrato)
        if (filtros.tipoDocumento) {
            licitacaoWhere.tipoDocumento = filtros.tipoDocumento;
        }
        // Filtro por Múltiplas UFs
        if (filtros.ufs && filtros.ufs.length > 0) {
            licitacaoWhere.uf = {
                in: filtros.ufs.map((u) => u.trim().toUpperCase()),
            };
        }
        // Filtro por Múltiplos Municípios
        if (filtros.municipios && filtros.municipios.length > 0) {
            licitacaoWhere.municipio = {
                in: filtros.municipios.map((m) => m.trim()),
            };
        }
        // Filtro por Modalidades
        if (filtros.modalidades && filtros.modalidades.length > 0) {
            licitacaoWhere.modalidadeNome = {
                in: filtros.modalidades.map((m) => m.trim()),
            };
        }
        // Filtro por Órgãos
        if (filtros.orgaos && filtros.orgaos.length > 0) {
            licitacaoWhere.orgaoRazaoSocial = {
                in: filtros.orgaos.map((o) => o.trim()),
            };
        }
        // Busca textual por Objeto, Órgão ou Município
        if (filtros.buscaTextual && filtros.buscaTextual.trim() !== '') {
            const termoBusca = filtros.buscaTextual.trim();
            licitacaoWhere.OR = [
                { objetoCompra: { contains: termoBusca } },
                { orgaoRazaoSocial: { contains: termoBusca } },
                { municipio: { contains: termoBusca } },
            ];
        }
        // Revalidação contra termos de exclusão ativos do tenant
        if (termosExclusao.length > 0) {
            const AND = licitacaoWhere.AND || [];
            termosExclusao.forEach((exclusao) => {
                AND.push({
                    objetoCompra: {
                        not: {
                            contains: exclusao.termo,
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
     * Obtém a lista distinta de órgãos disponíveis no banco de dados para filtro dinâmico
     */
    static async obterOrgaos() {
        const resultados = await prisma.licitacao.findMany({
            select: {
                orgaoRazaoSocial: true,
            },
            distinct: ['orgaoRazaoSocial'],
            orderBy: { orgaoRazaoSocial: 'asc' },
            take: 100,
        });
        const orgaos = resultados
            .map((r) => r.orgaoRazaoSocial)
            .filter((o) => Boolean(o && o.trim() !== ''));
        return { orgaos };
    }
    /**
     * Obtém a lista COMPLETA de municípios do IBGE para a UF selecionada (com suporte a Cachoeira Paulista, Cruzeiro, etc.)
     */
    static async obterMunicipiosPorUf(uf) {
        if (!uf || uf.trim() === '') {
            const resultados = await prisma.licitacao.findMany({
                select: { municipio: true },
                distinct: ['municipio'],
                take: 200,
            });
            const municipios = Array.from(new Set(resultados.map((r) => r.municipio).filter((m) => Boolean(m && m.trim() !== '')))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
            return { municipios };
        }
        const ufUpper = uf.trim().toUpperCase();
        // Cache em memória
        if (ibgeMunicipiosCache.has(ufUpper)) {
            return { municipios: ibgeMunicipiosCache.get(ufUpper) };
        }
        try {
            // Consulta API oficial do IBGE para a UF
            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufUpper}/municipios`, {
                headers: { 'Accept': 'application/json' },
            });
            if (response.ok) {
                const json = await response.json();
                if (Array.isArray(json) && json.length > 0) {
                    const municipiosIbge = json.map((item) => String(item.nome)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
                    ibgeMunicipiosCache.set(ufUpper, municipiosIbge);
                    console.log(`📍 [IBGE API] Carregados ${municipiosIbge.length} municípios completos para UF ${ufUpper}`);
                    return { municipios: municipiosIbge };
                }
            }
        }
        catch (err) {
            console.warn(`⚠️ [IBGE API] Falha ao buscar municípios de ${ufUpper}: ${err.message}`);
        }
        // Fallback no banco local
        const resultados = await prisma.licitacao.findMany({
            where: { uf: ufUpper },
            select: { municipio: true },
            distinct: ['municipio'],
            orderBy: { municipio: 'asc' },
        });
        const municipios = Array.from(new Set(resultados.map((r) => r.municipio).filter((m) => Boolean(m && m.trim() !== '')))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
        return { municipios };
    }
    /**
     * Atualiza o status do edital no funil do tenant
     */
    static async atualizarStatusMatch(tenantId, matchId, novoStatus, anotacoes) {
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
     * Estatísticas resumidas do funil do tenant.
     */
    static async obterMetricasFunil(tenantId) {
        const termosAtivos = await prisma.termoInteresse.findMany({
            where: { tenantId, ativo: true },
            select: { termo: true },
        });
        const resultado = {
            NOVA: 0,
            EM_ANALISE: 0,
            SALVA: 0,
            DESCARTADA: 0,
            TOTAL: 0,
        };
        if (termosAtivos.length === 0) {
            await prisma.licitacaoMatch.deleteMany({
                where: { tenantId },
            });
            return resultado;
        }
        const listaTermosAtivos = termosAtivos.map((t) => t.termo);
        const contadores = await prisma.licitacaoMatch.groupBy({
            by: ['status'],
            where: {
                tenantId,
                termosCorrespondentes: {
                    hasSome: listaTermosAtivos,
                },
            },
            _count: { _all: true },
        });
        contadores.forEach((item) => {
            resultado[item.status] = item._count._all;
            resultado.TOTAL += item._count._all;
        });
        return resultado;
    }
}
exports.LicitacoesService = LicitacoesService;
