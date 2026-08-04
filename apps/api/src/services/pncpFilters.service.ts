let cacheFiltros: any = null;
let ultimaAtualizacao: number = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hora


export class PncpFiltersService {
  /**
   * Obtém os filtros oficiais do PNCP, com cache em memória para evitar exceder rate limits.
   */
  static async obterFiltrosOficiais(tipoDocumento: string = 'edital') {
    const agora = Date.now();
    
    // Se temos cache e ele ainda é válido para "edital", retornamos o cache.
    // Para simplificar e performar, o cache é genérico (geralmente usamos edital na plataforma).
    if (cacheFiltros && (agora - ultimaAtualizacao) < CACHE_TTL && tipoDocumento === 'edital') {
      return cacheFiltros;
    }

    const url = `https://pncp.gov.br/api/search/filters?tipos_documento=${tipoDocumento}`;
    console.log(`🌐 [PNCP Filters] GET ${url}`);

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

      const json = await response.json();
      
      if (tipoDocumento === 'edital') {
        cacheFiltros = json;
        ultimaAtualizacao = agora;
      }

      return json;
    } catch (error) {
      console.error('❌ [PNCP Filters Erro]:', error);
      // Fallback para cache expirado se houver erro e tivermos algo
      if (cacheFiltros) {
        return cacheFiltros;
      }
      throw error;
    }
  }
}
