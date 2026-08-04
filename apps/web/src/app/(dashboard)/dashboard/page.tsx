'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { LicitacaoCard } from '../../../components/licitacoes/LicitacaoCard';
import { MultiSelectDropdown, Option } from '../../../components/common/MultiSelectDropdown';
import { fetchApi } from '../../../lib/api';
import {
  Search,
  Globe,
  RefreshCw,
  FileText,
  FileCheck,
  ScrollText,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Building2,
  MapPin,
  ExternalLink,
  DollarSign,
  Calendar,
  Bookmark,
  X,
  CheckCircle,
} from 'lucide-react';

export default function DashboardPage() {
  // Acervo retornado do PNCP
  const [itemsPncp, setItemsPncp] = useState<any[]>([]);

  // Abas Principais do PNCP (edital, ata, contrato)
  const [abaDocumento, setAbaDocumento] = useState<'edital' | 'ata' | 'contrato'>('edital');
  const [statusPncp, setStatusPncp] = useState<string>('recebendo_proposta');

  // Painel de Filtros Avançados Expansível (12 Filtros Oficiais PNCP)
  const [painelFiltrosAberto, setPainelFiltrosAberto] = useState(false);

  // Estados dos 12 Filtros Multi-Select
  const [ufsSelecionadas, setUfsSelecionadas] = useState<string[]>([]);
  const [municipiosSelecionados, setMunicipiosSelecionados] = useState<string[]>([]);
  const [municipiosDisponiveis, setMunicipiosDisponiveis] = useState<Option[]>([]);

  const [modalidadesSelecionadas, setModalidadesSelecionadas] = useState<string[]>([]);
  const [orgaosSelecionados, setOrgaosSelecionados] = useState<string[]>([]);
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<string[]>([]);
  const [esferasSelecionadas, setEsferasSelecionadas] = useState<string[]>([]);
  const [poderesSelecionados, setPoderesSelecionados] = useState<string[]>([]);
  const [fontesSelecionadas, setFontesSelecionadas] = useState<string[]>([]);
  const [margensSelecionadas, setMargensSelecionadas] = useState<string[]>([]);
  const [conteudoNacionalSelecionado, setConteudoNacionalSelecionado] = useState<string[]>([]);
  const [emendaSelecionada, setEmendaSelecionada] = useState<string[]>([]);

  const [buscaTextual, setBuscaTextual] = useState<string>('');


  // Paginação Oficial do PNCP
  const [pagina, setPagina] = useState<number>(1);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [totalItens, setTotalItens] = useState<number>(0);
  const [carregando, setCarregando] = useState(true);

  // Opções dos Filtros Dinâmicas
  const [opcoesUfs, setOpcoesUfs] = useState<Option[]>([]);
  const [opcoesModalidades, setOpcoesModalidades] = useState<Option[]>([]);
  const [opcoesEsferas, setOpcoesEsferas] = useState<Option[]>([]);
  const [opcoesPoderes, setOpcoesPoderes] = useState<Option[]>([]);
  const [opcoesFontes, setOpcoesFontes] = useState<Option[]>([]);
  const [opcoesMargens, setOpcoesMargens] = useState<Option[]>([]);
  const [opcoesOrgaos, setOpcoesOrgaos] = useState<Option[]>([]);
  const [opcoesUnidades, setOpcoesUnidades] = useState<Option[]>([]);
  const [municipiosPNCPOficial, setMunicipiosPNCPOficial] = useState<any[]>([]);



  const opcoesSimNao: Option[] = [
    { label: 'Sim', value: 'Sim' },
    { label: 'Não', value: 'Não' },
  ];

  // Carrega os 12 filtros dinamicamente do PNCP
  useEffect(() => {
    async function carregarFiltrosOficiais() {
      try {
        const res = await fetchApi<{ filters?: any }>('/licitacoes/explorador/filtros');
        if (res && res.filters) {
          const mapOptions = (arr: any[], valueKey = 'id', labelKey = 'nome') => {
            return (arr || []).map((item) => ({
              label: item[labelKey] || item[valueKey],
              value: item[valueKey]
            }));
          };
          
          setOpcoesUfs(mapOptions(res.filters.ufs, 'id', 'id'));
          setOpcoesModalidades(mapOptions(res.filters.modalidades));
          setOpcoesEsferas(mapOptions(res.filters.esferas));
          setOpcoesPoderes(mapOptions(res.filters.poderes));
          setOpcoesFontes(mapOptions(res.filters.fontes_orcamentarias));
          setOpcoesMargens(mapOptions(res.filters.tipos_margens_preferencia));
          
          setOpcoesOrgaos(mapOptions(res.filters.orgaos).slice(0, 300));
          setOpcoesUnidades(mapOptions(res.filters.unidades).slice(0, 300));
          
          setMunicipiosPNCPOficial(res.filters.municipios || []);
        }
      } catch (err) {
        console.error('Erro ao carregar filtros do PNCP:', err);
      }
    }
    carregarFiltrosOficiais();
  }, []);

  // Carrega Lista COMPLETA de Municípios do IBGE quando a UF é alterada e cruza com a árvore do PNCP
  useEffect(() => {
    async function carregarMunicipiosIbge() {
      if (ufsSelecionadas.length === 0) {
        setMunicipiosDisponiveis([]);
        setMunicipiosSelecionados([]);
        return;
      }
      try {
        const firstUf = ufsSelecionadas[0];
        const res = await fetchApi<{ municipios: string[] }>(`/licitacoes/municipios?uf=${firstUf}`);
        
        const cidadesIbge = res.municipios || [];
        const cidadesPncpUf = municipiosPNCPOficial.filter(m => 
          cidadesIbge.some(ibgeNome => {
            const nomPNCP = String(m.nome).toLowerCase();
            const nomIBGE = String(ibgeNome).toLowerCase();
            return nomPNCP === nomIBGE || nomPNCP.includes(nomIBGE) || nomIBGE.includes(nomPNCP);
          })
        );
        
        const opts = cidadesPncpUf.map((m: any) => ({
          label: m.nome,
          value: m.id // Enviamos o ID oficial do PNCP para evitar falhas por string
        }));
        
        if (opts.length === 0 && cidadesIbge.length > 0) {
           // Fallback
           setMunicipiosDisponiveis(cidadesIbge.map(m => ({ label: m, value: m })));
        } else {
           setMunicipiosDisponiveis(opts);
        }
      } catch (err) {
        console.error('Erro ao carregar cidades do IBGE:', err);
      }
    }
    carregarMunicipiosIbge();
  }, [ufsSelecionadas, municipiosPNCPOficial]);

  // Consulta Direta ao PNCP (Explorador Global com Repasse dos 12 Filtros)
  const carregarPNCP = useCallback(async () => {
    setCarregando(true);
    try {
      let queryParams = `?pagina=${pagina}&tamPagina=10&tipoDocumento=${abaDocumento}&status=${statusPncp}`;
      if (buscaTextual) queryParams += `&q=${encodeURIComponent(buscaTextual)}`;
      if (ufsSelecionadas.length > 0) queryParams += `&ufs=${encodeURIComponent(ufsSelecionadas.join(','))}`;
      if (municipiosSelecionados.length > 0) queryParams += `&municipios=${encodeURIComponent(municipiosSelecionados.join(','))}`;
      if (modalidadesSelecionadas.length > 0) queryParams += `&modalidades=${encodeURIComponent(modalidadesSelecionadas.join(','))}`;
      if (orgaosSelecionados.length > 0) queryParams += `&orgaos=${encodeURIComponent(orgaosSelecionados.join(','))}`;
      if (unidadesSelecionadas.length > 0) queryParams += `&unidades=${encodeURIComponent(unidadesSelecionadas.join(','))}`;
      if (esferasSelecionadas.length > 0) queryParams += `&esferas=${encodeURIComponent(esferasSelecionadas.join(','))}`;
      if (poderesSelecionados.length > 0) queryParams += `&poderes=${encodeURIComponent(poderesSelecionados.join(','))}`;
      if (fontesSelecionadas.length > 0) queryParams += `&fontesOrcamentarias=${encodeURIComponent(fontesSelecionadas.join(','))}`;
      if (margensSelecionadas.length > 0) queryParams += `&margensPreferencia=${encodeURIComponent(margensSelecionadas.join(','))}`;
      if (conteudoNacionalSelecionado.length > 0) queryParams += `&conteudoNacional=${encodeURIComponent(conteudoNacionalSelecionado.join(','))}`;
      if (emendaSelecionada.length > 0) queryParams += `&emendaParlamentar=${encodeURIComponent(emendaSelecionada.join(','))}`;

      const res = await fetchApi<{ items: any[]; total: number; totalPaginas: number }>(`/licitacoes/explorador${queryParams}`);

      const uniqueItems = Array.from(new Map(
        (res.items || []).map((item) => [item.numeroControlePNCP || item.id, item])
      ).values());

      setItemsPncp(uniqueItems);
      setTotalPaginas(res.totalPaginas || 1);
      setTotalItens(res.total || 0);
    } catch (err) {
      console.error('Erro ao explorar acervo do PNCP:', err);
    } finally {
      setCarregando(false);
    }
  }, [
    abaDocumento,
    statusPncp,
    buscaTextual,
    ufsSelecionadas,
    municipiosSelecionados,
    modalidadesSelecionadas,
    orgaosSelecionados,
    unidadesSelecionadas,
    esferasSelecionadas,
    poderesSelecionados,
    fontesSelecionadas,
    margensSelecionadas,
    conteudoNacionalSelecionado,
    emendaSelecionada,
    pagina,
  ]);

  useEffect(() => {
    carregarPNCP();
  }, [carregarPNCP]);

  const alternarAba = (novaAba: 'edital' | 'ata' | 'contrato') => {
    setAbaDocumento(novaAba);
    setPagina(1);
    if (novaAba === 'edital') {
      setStatusPncp('recebendo_proposta');
    } else {
      setStatusPncp('vigente');
    }
  };

  const handleSalvarNoFunil = async (item: any, novoStatus: 'EM_ANALISE' | 'SALVA') => {
    try {
      await fetchApi('/licitacoes/explorador/salvar', {
        method: 'POST',
        body: JSON.stringify({ item, status: novoStatus }),
      });
      await carregarPNCP();
    } catch (err) {
      console.error('Erro ao salvar edital no funil:', err);
    }
  };

  const limparTodosFiltros = () => {
    setUfsSelecionadas([]);
    setMunicipiosSelecionados([]);
    setModalidadesSelecionadas([]);
    setOrgaosSelecionados([]);
    setUnidadesSelecionadas([]);
    setEsferasSelecionadas([]);
    setPoderesSelecionados([]);
    setFontesSelecionadas([]);
    setMargensSelecionadas([]);
    setConteudoNacionalSelecionado([]);
    setEmendaSelecionada([]);
    setBuscaTextual('');
    setStatusPncp(abaDocumento === 'edital' ? 'recebendo_proposta' : 'vigente');
    setPagina(1);
  };

  const formatarMoeda = (valor?: number) => {
    if (!valor) return 'Sob Consulta';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const formatarData = (dataIso?: string | null) => {
    if (!dataIso) return 'Não informada';
    return new Date(dataIso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Explorador Global do PNCP (Acervo Oficial do Governo)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Consulte diretamente o banco nacional do Portal Nacional de Contratações Públicas com 12 filtros oficiais.
          </p>
        </div>

        <button
          onClick={() => carregarPNCP()}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${carregando ? 'animate-spin' : ''}`} />
          <span>Sincronizar com PNCP</span>
        </button>
      </div>

      {/* 3 Abas Principais de Consulta do PNCP */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => alternarAba('edital')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            abaDocumento === 'edital'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Editais e Avisos de Contratação</span>
        </button>

        <button
          onClick={() => alternarAba('ata')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            abaDocumento === 'ata'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <ScrollText className="w-4 h-4" />
          <span>Atas de Registro de Preços</span>
        </button>

        <button
          onClick={() => alternarAba('contrato')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            abaDocumento === 'contrato'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Contratos Celebrados</span>
        </button>
      </div>

      {/* Banner Informativo com Contador Oficial */}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">
            Acervo Oficial do PNCP: {totalItens.toLocaleString('pt-BR')} resultados encontrados
          </span>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-0.5">
            Exibindo Oportunidades Públicas Ativas em tempo real.
          </p>
        </div>

        <select
          value={statusPncp}
          onChange={(e) => {
            setStatusPncp(e.target.value);
            setPagina(1);
          }}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
        >
          {abaDocumento === 'edital' ? (
            <>
              <option value="recebendo_proposta">Recebendo Proposta (Abertos)</option>
              <option value="em_julgamento">Em Julgamento</option>
              <option value="encerradas">Encerradas</option>
              <option value="todos">Todos os Status</option>
            </>
          ) : (
            <>
              <option value="vigente">Vigentes</option>
              <option value="encerradas">Encerrados</option>
              <option value="todos">Todos os Status</option>
            </>
          )}
        </select>
      </div>

      {/* Barra de Busca e Filtros Avançados */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Campo de Busca Textual */}
          <div className="flex-1 relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={buscaTextual}
              onChange={(e) => {
                setBuscaTextual(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar palavra-chave no objeto da compra ou título do edital..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Botão de Toggle do Painel dos 12 Filtros Avançados */}
          <button
            onClick={() => setPainelFiltrosAberto(!painelFiltrosAberto)}
            className={`py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all shrink-0 ${
              painelFiltrosAberto
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>⚙️ 12 Filtros Oficiais PNCP</span>
            {painelFiltrosAberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Painel Expansível dos 12 Filtros Oficiais do PNCP */}
        {painelFiltrosAberto && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* 1. Tipos de Instrumento Convocatório */}
              <MultiSelectDropdown
                label="1. Tipos de Instrumento"
                placeholder="Todos os instrumentos"
                options={[
                  { label: 'Edital / Aviso', value: 'edital' },
                  { label: 'Ata de Registro de Preços', value: 'ata' },
                  { label: 'Contrato Celebrado', value: 'contrato' },
                ]}
                selectedValues={[abaDocumento]}
                onChange={(vals) => {
                  if (vals.length > 0) alternarAba(vals[0] as any);
                }}
              />

              {/* 2. Modalidades da Contratação */}
              <MultiSelectDropdown
                label="2. Modalidades da Contratação"
                placeholder="Todas as modalidades"
                options={opcoesModalidades}
                selectedValues={modalidadesSelecionadas}
                onChange={(vals) => {
                  setModalidadesSelecionadas(vals);
                  setPagina(1);
                }}
              />

              {/* 3. Órgãos */}
              <MultiSelectDropdown
                label="3. Órgãos Compradores"
                placeholder="Buscar órgãos..."
                options={opcoesOrgaos.length > 0 ? opcoesOrgaos : orgaosSelecionados.map((o) => ({ label: o, value: o }))}
                selectedValues={orgaosSelecionados}
                onChange={(vals) => {
                  setOrgaosSelecionados(vals);
                  setPagina(1);
                }}
              />

              {/* 4. Unidades Compradoras */}
              <MultiSelectDropdown
                label="4. Unidades Compradoras"
                placeholder="Buscar unidades..."
                options={opcoesUnidades.length > 0 ? opcoesUnidades : unidadesSelecionadas.map((u) => ({ label: u, value: u }))}
                selectedValues={unidadesSelecionadas}
                onChange={(vals) => {
                  setUnidadesSelecionadas(vals);
                  setPagina(1);
                }}
              />

              {/* 5. UFs (Estados) */}
              <MultiSelectDropdown
                label="5. UFs (Estados)"
                placeholder="Todas as UFs (Brasil)"
                options={opcoesUfs}
                selectedValues={ufsSelecionadas}
                onChange={(vals) => {
                  setUfsSelecionadas(vals);
                  setPagina(1);
                }}
              />

              {/* 6. Municípios (Lista Completa do IBGE para a UF) */}
              <MultiSelectDropdown
                label="6. Municípios (IBGE)"
                placeholder={ufsSelecionadas.length > 0 ? "Buscar municípios do estado..." : "Escolha UF primeiro"}
                options={municipiosDisponiveis}
                selectedValues={municipiosSelecionados}
                onChange={(vals) => {
                  setMunicipiosSelecionados(vals);
                  setPagina(1);
                }}
                disabled={ufsSelecionadas.length === 0}
              />

              {/* 7. Esferas */}
              <MultiSelectDropdown
                label="7. Esferas"
                placeholder="Todas as esferas"
                options={opcoesEsferas}
                selectedValues={esferasSelecionadas}
                onChange={(vals) => {
                  setEsferasSelecionadas(vals);
                  setPagina(1);
                }}
              />

              {/* 8. Poderes */}
              <MultiSelectDropdown
                label="8. Poderes"
                placeholder="Todos os poderes"
                options={opcoesPoderes}
                selectedValues={poderesSelecionados}
                onChange={(vals) => {
                  setPoderesSelecionados(vals);
                  setPagina(1);
                }}
              />

              {/* 9. Fontes Orçamentárias */}
              <MultiSelectDropdown
                label="9. Fontes Orçamentárias"
                placeholder="Todas as fontes"
                options={opcoesFontes}
                selectedValues={fontesSelecionadas}
                onChange={(vals) => {
                  setFontesSelecionadas(vals);
                  setPagina(1);
                }}
              />

              {/* 10. Margens de Preferência */}
              <MultiSelectDropdown
                label="10. Margens de Preferência"
                placeholder="Todas as margens"
                options={opcoesMargens}
                selectedValues={margensSelecionadas}
                onChange={(vals) => {
                  setMargensSelecionadas(vals);
                  setPagina(1);
                }}
              />

              {/* 11. Conteúdo Nacional */}
              <MultiSelectDropdown
                label="11. Conteúdo Nacional"
                placeholder="Todos"
                options={opcoesSimNao}
                selectedValues={conteudoNacionalSelecionado}
                onChange={(vals) => {
                  setConteudoNacionalSelecionado(vals);
                  setPagina(1);
                }}
              />

              {/* 12. Emenda Parlamentar */}
              <MultiSelectDropdown
                label="12. Emenda Parlamentar"
                placeholder="Todos"
                options={opcoesSimNao}
                selectedValues={emendaSelecionada}
                onChange={(vals) => {
                  setEmendaSelecionada(vals);
                  setPagina(1);
                }}
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={limparTodosFiltros}
                className="text-xs text-red-600 dark:text-red-400 hover:underline font-semibold flex items-center gap-1 focus:outline-none"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Limpar os 12 Filtros</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Listagem em Linhas Clean Espelhada do PNCP */}
      {carregando ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : itemsPncp.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Nenhum edital retornado pela busca no PNCP</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Tente alterar o termo digitado ou redefinir a UF e os filtros do portal.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {itemsPncp.map((item, index) => (
            <LicitacaoCard
              key={`${item.numeroControlePNCP || item.id}-${index}`}
              item={item}
            />
          ))}
        </div>
      )}



      {/* Paginação Fluida Oficial do PNCP */}
      {!carregando && totalPaginas > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <p>
            Página <span className="font-bold text-slate-900 dark:text-slate-200">{pagina}</span> de{' '}
            <span className="font-bold text-slate-900 dark:text-slate-200">{totalPaginas}</span> (Total:{' '}
            <span className="font-bold text-slate-900 dark:text-slate-200">{totalItens.toLocaleString('pt-BR')}</span> resultados)
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 font-semibold transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center gap-1 font-semibold transition-all shadow-sm"
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
