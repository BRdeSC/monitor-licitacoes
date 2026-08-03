import { ILicitacaoProvider, LicitacaoDTO } from './ILicitacaoProvider';

export class PNCPProvider implements ILicitacaoProvider {
  readonly nome = 'PNCP (Portal Nacional de Contratações Públicas - High Performance Search)';

  /**
   * Consome o endpoint de alta performance /api/search/ do PNCP
   * Suporta busca por termos de interesse, status ('recebendo_proposta' | 'encerradas') e filtro opcional de UF.
   */
  async buscarEditais(
    termo: string,
    uf?: string,
    status: string = 'recebendo_proposta'
  ): Promise<LicitacaoDTO[]> {
    const todosItens: LicitacaoDTO[] = [];
    const tamPagina = 50;
    const maxPaginas = 3; // Busca até 150 editais por termo/status

    const baseUrl = 'https://pncp.gov.br/api/search/';

    for (let pagina = 1; pagina <= maxPaginas; pagina++) {
      try {
        const params = new URLSearchParams({
          q: termo,
          tipos_documento: 'edital',
          status: status,
          pagina: String(pagina),
          tam_pagina: String(tamPagina),
        });

        if (uf && uf.trim() !== '') {
          params.append('uf', uf.trim().toUpperCase());
        }

        const url = `${baseUrl}?${params.toString()}`;

        console.log(`🤖 [PNCP Search] Buscando: q="${termo}" | status="${status}" | uf="${uf || 'TODAS'}" | pag=${pagina}...`);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });

        if (!response.ok) {
          console.warn(`⚠️ [PNCP Search] HTTP ${response.status} (${response.statusText}) para o termo "${termo}".`);
          break;
        }

        const responseText = await response.text();
        if (!responseText || !responseText.trim()) {
          break;
        }

        // Pausa defensiva de 300ms entre requisições
        await new Promise((resolve) => setTimeout(resolve, 300));

        let json: any;
        try {
          json = JSON.parse(responseText);
        } catch {
          console.warn(`⚠️ [PNCP Search] Resposta não-JSON para o termo "${termo}".`);
          break;
        }

        const rawItems = json.items || [];
        if (!rawItems || rawItems.length === 0) {
          break;
        }

        const normalizados: LicitacaoDTO[] = rawItems.map((item: any) => {
          const itemUrl = item.item_url || item.linkPNCP || '';
          const fullLink = itemUrl ? (itemUrl.startsWith('http') ? itemUrl : `https://pncp.gov.br${itemUrl}`) : undefined;

          return {
            numeroControlePNCP: item.numero_controle_pncp || `PNCP-${item.id || Math.random().toString(36).substring(7)}`,
            orgaoEntidade: {
              razaoSocial: item.orgao_nome || item.orgaoRazaoSocial || 'Órgão Não Informado',
              cnpj: item.orgao_cnpj || item.orgaoCnpj || '00000000000000',
            },
            unidadeOrgao: {
              ufSigla: item.uf || uf || 'SP',
              municipioNome: item.municipio_nome || item.municipio || 'Município Não Informado',
            },
            modalidadeNome: item.modalidade_licitacao_nome || item.tipo_nome || 'Pregão - Eletrônico',
            objetoCompra: item.description || item.title || 'Objeto não informado',
            valorTotalEstimado: item.valor_global ? Number(item.valor_global) : undefined,
            dataPublicacaoPncp: item.data_publicacao_pncp || item.createdAt || new Date().toISOString(),
            dataAberturaProposta: item.data_inicio_vigencia || item.data_publicacao_pncp || null,
            dataEncerramentoProposta: item.data_fim_vigencia || item.data_fim_proposta || null,
            linkSistemaOrigem: fullLink,
          };
        });

        todosItens.push(...normalizados);

        if (rawItems.length < tamPagina) {
          break;
        }
      } catch (err: any) {
        console.error(`❌ [PNCP Search Erro q="${termo}"]:`, err.message);
        break;
      }
    }

    console.log(`✅ [PNCP Search] Termo "${termo}": Coletados ${todosItens.length} editais.`);
    return todosItens;
  }
}
