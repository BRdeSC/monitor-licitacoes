'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { LicitacaoMatch, MatchStatus, MetricasFunil } from '../../../lib/types';
import { LicitacaoCard } from '../../../components/licitacoes/LicitacaoCard';
import { fetchApi } from '../../../lib/api';
import {
  Filter,
  Search,
  Sparkles,
  RefreshCw,
  Bookmark,
  Eye,
  XCircle,
  Clock,
  Archive,
  Info,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [matches, setMatches] = useState<LicitacaoMatch[]>([]);
  const [metricas, setMetricas] = useState<MetricasFunil>({ NOVA: 0, EM_ANALISE: 0, SALVA: 0, DESCARTADA: 0, TOTAL: 0 });
  const [statusFiltro, setStatusFiltro] = useState<string>('TODAS');
  const [abaPrazo, setAbaPrazo] = useState<'ABERTAS' | 'ENCERRADAS' | 'TODAS'>('ABERTAS');
  const [ufFiltro, setUfFiltro] = useState<string>('');
  const [municipioFiltro, setMunicipioFiltro] = useState<string>('');
  const [municipiosDisponiveis, setMunicipiosDisponiveis] = useState<string[]>([]);
  const [buscaTextual, setBuscaTextual] = useState<string>('');
  const [pagina, setPagina] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [totalItens, setTotalItens] = useState<number>(0);
  const [carregando, setCarregando] = useState(true);

  // Carrega cidades dinâmicas ao selecionar uma UF
  useEffect(() => {
    async function carregarMunicipios() {
      if (!ufFiltro) {
        setMunicipiosDisponiveis([]);
        setMunicipioFiltro('');
        return;
      }
      try {
        const res = await fetchApi<{ municipios: string[] }>(`/licitacoes/municipios?uf=${ufFiltro}`);
        setMunicipiosDisponiveis(res.municipios || []);
      } catch (err) {
        console.error('Erro ao carregar cidades da UF:', err);
      }
    }
    carregarMunicipios();
  }, [ufFiltro]);

  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      let queryParams = `?pagina=${pagina}&limite=12`;
      if (statusFiltro !== 'TODAS') queryParams += `&status=${statusFiltro}`;
      if (ufFiltro) queryParams += `&ufs=${ufFiltro}`;
      if (municipioFiltro) queryParams += `&municipios=${encodeURIComponent(municipioFiltro)}`;
      if (buscaTextual) queryParams += `&busca=${encodeURIComponent(buscaTextual)}`;

      const [resMatches, resMetricas] = await Promise.all([
        fetchApi<{ matches: LicitacaoMatch[]; total: number; totalPaginas: number }>(`/licitacoes/matches${queryParams}`),
        fetchApi<MetricasFunil>('/licitacoes/metricas'),
      ]);

      setMatches(resMatches.matches);
      setTotalPaginas(resMatches.totalPaginas || 1);
      setTotalItens(resMatches.total || 0);
      setMetricas(resMetricas);
    } catch (err) {
      console.error('Erro ao carregar oportunidades:', err);
    } finally {
      setCarregando(false);
    }
  }, [statusFiltro, ufFiltro, municipioFiltro, buscaTextual, pagina]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleAtualizarStatus = async (id: string, novoStatus: MatchStatus) => {
    try {
      await fetchApi(`/licitacoes/matches/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: novoStatus }),
      });
      await carregarDados();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  // Filtragem local por Visão (Abertas vs Encerradas/Histórico)
  const matchesFiltrados = useMemo(() => {
    const agora = new Date().getTime();
    return matches.filter((item) => {
      if (abaPrazo === 'TODAS') return true;

      const encerramento = item.licitacao.dataEncerramentoProposta
        ? new Date(item.licitacao.dataEncerramentoProposta).getTime()
        : null;

      if (abaPrazo === 'ABERTAS') {
        return !encerramento || encerramento > agora;
      }

      if (abaPrazo === 'ENCERRADAS') {
        return encerramento !== null && encerramento <= agora;
      }

      return true;
    });
  }, [matches, abaPrazo]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            Funil de Oportunidades de Licitações
          </h1>
          <p className="text-xs text-slate-400">
            Editais capturados do PNCP em tempo real de acordo com as regras ativas do seu tenant.
          </p>
        </div>

        <button
          onClick={() => carregarDados()}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${carregando ? 'animate-spin' : ''}`} />
          <span>Atualizar Oportunidades</span>
        </button>
      </div>

      {/* Navegação de Abas: Oportunidades Abertas vs Histórico Encerradas */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => {
            setAbaPrazo('ABERTAS');
            setPagina(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            abaPrazo === 'ABERTAS'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Oportunidades Abertas</span>
        </button>

        <button
          onClick={() => {
            setAbaPrazo('ENCERRADAS');
            setPagina(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            abaPrazo === 'ENCERRADAS'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Archive className="w-4 h-4" />
          <span>Histórico & Encerradas</span>
        </button>

        <button
          onClick={() => {
            setAbaPrazo('TODAS');
            setPagina(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
            abaPrazo === 'TODAS'
              ? 'bg-slate-800 text-slate-100 border border-slate-700'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Todas as Visões</span>
        </button>
      </div>

      {/* Cards de Métricas do Funil */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => {
            setStatusFiltro('TODAS');
            setPagina(1);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFiltro === 'TODAS'
              ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <p className="text-[11px] font-medium text-slate-400">Total no Acervo</p>
          <p className="text-xl font-bold mt-1 text-slate-100">{metricas.TOTAL}</p>
        </button>

        <button
          onClick={() => {
            setStatusFiltro('NOVA');
            setPagina(1);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFiltro === 'NOVA'
              ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-400">Novas</p>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          </div>
          <p className="text-xl font-bold mt-1 text-blue-400">{metricas.NOVA}</p>
        </button>

        <button
          onClick={() => {
            setStatusFiltro('EM_ANALISE');
            setPagina(1);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFiltro === 'EM_ANALISE'
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-400">Em Análise</p>
            <Eye className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-xl font-bold mt-1 text-amber-400">{metricas.EM_ANALISE}</p>
        </button>

        <button
          onClick={() => {
            setStatusFiltro('SALVA');
            setPagina(1);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFiltro === 'SALVA'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-400">Salvas</p>
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-xl font-bold mt-1 text-emerald-400">{metricas.SALVA}</p>
        </button>

        <button
          onClick={() => {
            setStatusFiltro('DESCARTADA');
            setPagina(1);
          }}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFiltro === 'DESCARTADA'
              ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-md'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-slate-400">Descartadas</p>
            <XCircle className="w-3.5 h-3.5 text-red-400" />
          </div>
          <p className="text-xl font-bold mt-1 text-red-400">{metricas.DESCARTADA}</p>
        </button>
      </div>

      {/* Banner de Informação UX */}
      <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-2.5 text-xs text-blue-300">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Filtros Geográficos e Busca Dinâmica:</span> Selecione a UF e a cidade desejada para refinar instantaneamente as oportunidades. Caso queira alterar as palavras de busca automatizada do robô, acesse a tela <strong className="underline">Interesses & Filtros</strong>.
        </div>
      </div>

      {/* Barra de Busca e Filtros Geográficos Avançados */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        {/* Campo de Busca Textual */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={buscaTextual}
            onChange={(e) => {
              setBuscaTextual(e.target.value);
              setPagina(1);
            }}
            placeholder="Buscar por objeto da compra, órgão público ou palavras..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Dropdown de Seleção de UF */}
        <div className="sm:col-span-3 relative">
          <Filter className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <select
            value={ufFiltro}
            onChange={(e) => {
              setUfFiltro(e.target.value);
              setMunicipioFiltro('');
              setPagina(1);
            }}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 appearance-none"
          >
            <option value="">Todas as UFs (Brasil)</option>
            <option value="SP">São Paulo (SP)</option>
            <option value="RJ">Rio de Janeiro (RJ)</option>
            <option value="MG">Minas Gerais (MG)</option>
            <option value="DF">Distrito Federal (DF)</option>
            <option value="PR">Paraná (PR)</option>
            <option value="SC">Santa Catarina (SC)</option>
            <option value="RS">Rio Grande do Sul (RS)</option>
            <option value="BA">Bahia (BA)</option>
            <option value="PE">Pernambuco (PE)</option>
            <option value="ES">Espírito Santo (ES)</option>
            <option value="GO">Goiás (GO)</option>
          </select>
        </div>

        {/* Dropdown Dinâmico de Seleção de Município */}
        <div className="sm:col-span-3 relative">
          <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <select
            value={municipioFiltro}
            onChange={(e) => {
              setMunicipioFiltro(e.target.value);
              setPagina(1);
            }}
            disabled={!ufFiltro}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 appearance-none disabled:opacity-50"
          >
            <option value="">
              {ufFiltro ? `Todas as Cidades de ${ufFiltro}` : 'Selecione uma UF primeiro'}
            </option>
            {municipiosDisponiveis.map((m, idx) => (
              <option key={idx} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Cards com Loading Skeletons */}
      {carregando ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-800 rounded w-24"></div>
                <div className="h-5 bg-slate-800 rounded w-20"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-10 bg-slate-800 rounded w-full"></div>
              </div>
              <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              <div className="pt-3 border-t border-slate-800 flex justify-between">
                <div className="h-6 bg-slate-800 rounded w-28"></div>
                <div className="h-6 bg-slate-800 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : matchesFiltrados.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
          <p className="text-slate-300 font-semibold text-sm">Nenhuma oportunidade encontrada</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Não há licitações correspondentes aos filtros selecionados. Tente alterar a UF, a cidade ou limpar o campo de busca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchesFiltrados.map((match) => (
            <LicitacaoCard key={match.id} match={match} onAtualizarStatus={handleAtualizarStatus} />
          ))}
        </div>
      )}

      {/* Paginação Fluida */}
      {!carregando && totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <p>
            Página <span className="font-semibold text-slate-200">{pagina}</span> de{' '}
            <span className="font-semibold text-slate-200">{totalPaginas}</span> (Total de{' '}
            <span className="font-semibold text-slate-200">{totalItens}</span> oportunidades)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 flex items-center gap-1 font-semibold transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 flex items-center gap-1 font-semibold transition-all"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
