"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PncpExplorerService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PncpExplorerService {
    /**
     * Obtém um edital específico do PNCP pelo seu número de controle
     */
    static async obterPorId(tenantId, id) {
        const url = `https://pncp.gov.br/api/search/?q=${encodeURIComponent(id)}`;
        console.log(`🌐 [PNCP] GET ${url}`);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                },
            });
            if (!response.ok) {
                throw new Error(`Erro na API do PNCP: HTTP ${response.status}`);
            }
            const json = (await response.json());
            const rawItems = json.items || [];
            if (rawItems.length === 0) {
                return null;
            }
            const item = rawItems[0];
            let fullLink = '';
            if (item.orgao_cnpj && item.ano && item.numero_sequencial) {
                fullLink = `https://pncp.gov.br/app/editais/${item.orgao_cnpj}/${item.ano}/${item.numero_sequencial}`;
            }
            else {
                let itemUrl = item.item_url || item.linkPNCP || '';
                if (itemUrl) {
                    if (itemUrl.startsWith('http')) {
                        fullLink = itemUrl;
                    }
                    else if (itemUrl.startsWith('/compras/')) {
                        fullLink = `https://pncp.gov.br/app/editais${itemUrl.replace('/compras/', '/')}`;
                    }
                    else {
                        fullLink = `https://pncp.gov.br${itemUrl}`;
                    }
                }
                else {
                    fullLink = `https://pncp.gov.br/app/editais`;
                }
            }
            const matchExistente = await prisma.licitacaoMatch.findFirst({
                where: {
                    tenantId,
                    licitacao: { numeroControlePNCP: item.numero_controle_pncp },
                },
                include: { licitacao: true }
            });
            return {
                id: item.numero_controle_pncp,
                numeroControlePNCP: item.numero_controle_pncp,
                numeroSequencial: item.numero_sequencial,
                ano: item.ano,
                orgaoRazaoSocial: item.orgao_nome || item.orgaoRazaoSocial || 'Órgão Não Informado',
                orgaoCnpj: item.orgao_cnpj || item.orgaoCnpj || '00000000000000',
                unidadeCompradora: item.unidade_orgao_nome || item.unidade_nome || 'Não informada',
                uf: item.uf || 'SP',
                municipio: item.municipio_nome || item.municipio || 'Município Não Informado',
                modalidadeNome: item.modalidade_licitacao_nome || item.tipo_nome || 'Pregão - Eletrônico',
                amparoLegal: item.amparo_legal_nome || 'Não informado',
                modoDisputa: item.modo_disputa_nome || 'Não informado',
                tipo: item.tipo_nome || 'Não informado',
                registroPreco: item.srp ? 'Sim' : 'Não',
                tipoDocumento: item.document_type || 'edital',
                objetoCompra: item.description || item.title || 'Objeto não informado',
                valorTotalEstimado: item.valor_global ? Number(item.valor_global) : undefined,
                valorTotalHomologado: item.valor_total_homologado ? Number(item.valor_total_homologado) : undefined,
                dataPublicacaoPncp: item.data_publicacao_pncp || item.createdAt || new Date().toISOString(),
                dataAberturaProposta: item.data_inicio_vigencia || item.data_publicacao_pncp || null,
                dataEncerramentoProposta: item.data_fim_vigencia || item.data_fim_proposta || null,
                linkSistemaOrigem: fullLink,
                processo: item.processo || 'Não informado',
                statusNoFunil: matchExistente ? matchExistente.status : null,
                matchId: matchExistente ? matchExistente.id : null,
            };
        }
        catch (error) {
            console.error('❌ [PNCP API Erro (obterPorId)]:', error);
            throw error;
        }
    }
    /**
     * Consulta diretamente o endpoint de alta performance /api/search/ do PNCP Oficial.
     * Repassa estritamente os 12 filtros para o portal oficial.
     */
    static async explorarPNCP(tenantId, filtros) {
        const pagina = Math.max(1, filtros.pagina || 1);
        const tamPagina = Math.max(1, Math.min(100, filtros.tamPagina || 10));
        const tipoDocumento = filtros.tipoDocumento || 'edital';
        // Mapeamento Estrito dos Status por Tipo de Documento
        let statusPadrao = 'recebendo_proposta';
        if (tipoDocumento === 'ata' || tipoDocumento === 'contrato') {
            statusPadrao = 'vigente';
        }
        const statusFinal = filtros.status || statusPadrao;
        const ordenacao = filtros.ordenacao || '-data';
        const baseUrl = 'https://pncp.gov.br/api/search/';
        const params = new URLSearchParams({
            tipos_documento: tipoDocumento,
            pagina: String(pagina),
            tam_pagina: String(tamPagina),
            ordenacao: ordenacao,
        });
        if (filtros.q && filtros.q.trim() !== '') {
            params.append('q', filtros.q.trim());
        }
        if (statusFinal && statusFinal !== 'todos') {
            params.append('status', statusFinal);
        }
        // 1. UFs
        if (filtros.ufs && filtros.ufs.length > 0) {
            filtros.ufs.forEach((uf) => {
                if (uf && uf.trim() !== '') {
                    params.append('uf', uf.trim().toUpperCase());
                }
            });
        }
        // 2. Municípios
        if (filtros.municipios && filtros.municipios.length > 0) {
            filtros.municipios.forEach((m) => {
                if (m && m.trim() !== '') {
                    params.append('municipio', m.trim());
                }
            });
        }
        // 3. Modalidades
        if (filtros.modalidades && filtros.modalidades.length > 0) {
            filtros.modalidades.forEach((mod) => {
                if (mod && mod.trim() !== '') {
                    params.append('modalidade', mod.trim());
                }
            });
        }
        // 4. Órgãos
        if (filtros.orgaos && filtros.orgaos.length > 0) {
            filtros.orgaos.forEach((o) => {
                if (o && o.trim() !== '') {
                    params.append('orgao', o.trim());
                }
            });
        }
        // 5. Esferas
        if (filtros.esferas && filtros.esferas.length > 0) {
            filtros.esferas.forEach((e) => {
                if (e && e.trim() !== '') {
                    params.append('esfera', e.trim());
                }
            });
        }
        // 6. Poderes
        if (filtros.poderes && filtros.poderes.length > 0) {
            filtros.poderes.forEach((p) => {
                if (p && p.trim() !== '') {
                    params.append('poder', p.trim());
                }
            });
        }
        const url = `${baseUrl}?${params.toString()}`;
        console.log(`🌐 [PNCP Explorador 12 Filtros] GET ${url}`);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });
            if (!response.ok) {
                console.warn(`⚠️ [PNCP Explorador] HTTP ${response.status} (${response.statusText})`);
                return {
                    total: 0,
                    pagina,
                    tamPagina,
                    totalPaginas: 1,
                    items: [],
                };
            }
            const json = await response.json();
            let rawItems = json.items || [];
            // Filtro Estrito no Backend: Se o usuário selecionou UFs ou Municípios, filtra estritamente na memória
            if (filtros.ufs && filtros.ufs.length > 0) {
                const ufsUpper = filtros.ufs.map((u) => u.trim().toUpperCase());
                rawItems = rawItems.filter((item) => item.uf && ufsUpper.includes(String(item.uf).toUpperCase()));
            }
            if (filtros.municipios && filtros.municipios.length > 0) {
                const isNumeric = (str) => !isNaN(Number(str)) && str.trim() !== '';
                const hasIds = filtros.municipios.some(isNumeric);
                // Só aplica filtro estrito por nome se os valores não forem IDs oficiais do PNCP
                if (!hasIds) {
                    const municsLower = filtros.municipios.map((m) => m.trim().toLowerCase());
                    rawItems = rawItems.filter((item) => item.municipio_nome && municsLower.includes(String(item.municipio_nome).toLowerCase()));
                }
            }
            const totalOriginal = json.total !== undefined ? Number(json.total) : rawItems.length;
            const totalPaginasOriginal = json.total_paginas !== undefined ? Number(json.total_paginas) : Math.ceil(totalOriginal / tamPagina);
            // Carrega matches existentes do tenant para indicar se o edital já está salvo no funil
            const numeroControles = rawItems.map((item) => item.numero_controle_pncp).filter(Boolean);
            const matchesExistentes = await prisma.licitacaoMatch.findMany({
                where: {
                    tenantId,
                    licitacao: {
                        numeroControlePNCP: { in: numeroControles },
                    },
                },
                include: { licitacao: true },
            });
            const matchesMap = new Map(matchesExistentes.map((m) => [m.licitacao.numeroControlePNCP, m]));
            // Normaliza os itens do PNCP
            const items = rawItems.map((item) => {
                let fullLink = '';
                // Prioriza o padrão oficial exigido: https://pncp.gov.br/app/editais/{CNPJ}/{ANO}/{SEQUENCIAL}
                if (item.orgao_cnpj && item.ano && item.numero_sequencial) {
                    fullLink = `https://pncp.gov.br/app/editais/${item.orgao_cnpj}/${item.ano}/${item.numero_sequencial}`;
                }
                else {
                    let itemUrl = item.item_url || item.linkPNCP || '';
                    if (itemUrl) {
                        if (itemUrl.startsWith('http')) {
                            fullLink = itemUrl;
                        }
                        else if (itemUrl.startsWith('/compras/')) {
                            fullLink = `https://pncp.gov.br/app/editais${itemUrl.replace('/compras/', '/')}`;
                        }
                        else {
                            fullLink = `https://pncp.gov.br${itemUrl}`;
                        }
                    }
                    else {
                        fullLink = `https://pncp.gov.br/app/editais`;
                    }
                }
                const numPncp = item.numero_controle_pncp || `PNCP-${item.id || Math.random().toString(36).substring(7)}`;
                const matchExistente = matchesMap.get(numPncp);
                return {
                    id: numPncp,
                    numeroControlePNCP: numPncp,
                    orgaoRazaoSocial: item.orgao_nome || item.orgaoRazaoSocial || 'Órgão Não Informado',
                    orgaoCnpj: item.orgao_cnpj || item.orgaoCnpj || '00000000000000',
                    uf: item.uf || 'SP',
                    municipio: item.municipio_nome || item.municipio || 'Município Não Informado',
                    modalidadeNome: item.modalidade_licitacao_nome || item.tipo_nome || 'Pregão - Eletrônico',
                    tipoDocumento: tipoDocumento || item.document_type || 'edital',
                    objetoCompra: item.description || item.title || 'Objeto não informado',
                    valorTotalEstimado: item.valor_global ? Number(item.valor_global) : undefined,
                    dataPublicacaoPncp: item.data_publicacao_pncp || item.createdAt || new Date().toISOString(),
                    dataAberturaProposta: item.data_inicio_vigencia || item.data_publicacao_pncp || null,
                    dataEncerramentoProposta: item.data_fim_vigencia || item.data_fim_proposta || null,
                    linkSistemaOrigem: fullLink,
                    statusNoFunil: matchExistente ? matchExistente.status : null,
                    matchId: matchExistente ? matchExistente.id : null,
                };
            });
            return {
                total: totalOriginal,
                pagina,
                tamPagina,
                totalPaginas: totalPaginasOriginal,
                items,
            };
        }
        catch (err) {
            console.error('❌ [PNCP Explorador Erro]:', err.message);
            return {
                total: 0,
                pagina,
                tamPagina,
                totalPaginas: 1,
                items: [],
            };
        }
    }
    /**
     * Salva ou atualiza a oportunidade do PNCP direto no funil do tenant logado.
     */
    static async salvarNoFunil(tenantId, itemPncp, novoStatus = 'SALVA') {
        const licitacaoSalva = await prisma.licitacao.upsert({
            where: { numeroControlePNCP: itemPncp.numeroControlePNCP },
            update: {
                objetoCompra: itemPncp.objetoCompra,
                valorTotalEstimado: itemPncp.valorTotalEstimado,
            },
            create: {
                numeroControlePNCP: itemPncp.numeroControlePNCP,
                orgaoRazaoSocial: itemPncp.orgaoRazaoSocial,
                orgaoCnpj: itemPncp.orgaoCnpj || '00000000000000',
                uf: itemPncp.uf || 'SP',
                municipio: itemPncp.municipio || 'Município Não Informado',
                modalidadeNome: itemPncp.modalidadeNome || 'Pregão - Eletrônico',
                tipoDocumento: itemPncp.tipoDocumento || 'edital',
                objetoCompra: itemPncp.objetoCompra,
                valorTotalEstimado: itemPncp.valorTotalEstimado,
                dataPublicacaoPncp: new Date(itemPncp.dataPublicacaoPncp || Date.now()),
                dataAberturaProposta: itemPncp.dataAberturaProposta ? new Date(itemPncp.dataAberturaProposta) : null,
                dataEncerramentoProposta: itemPncp.dataEncerramentoProposta ? new Date(itemPncp.dataEncerramentoProposta) : null,
                linkSistemaOrigem: itemPncp.linkSistemaOrigem,
            },
        });
        return prisma.licitacaoMatch.upsert({
            where: {
                tenantId_licitacaoId: {
                    tenantId,
                    licitacaoId: licitacaoSalva.id,
                },
            },
            update: {
                status: novoStatus,
            },
            create: {
                tenantId,
                licitacaoId: licitacaoSalva.id,
                status: novoStatus,
                termosCorrespondentes: ['Adicionado via Explorador Global'],
            },
            include: {
                licitacao: true,
            },
        });
    }
}
exports.PncpExplorerService = PncpExplorerService;
