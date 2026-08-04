'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../../../lib/api';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Bookmark,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function LicitacaoDetalhePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;
  
  const [detalhe, setDetalhe] = useState<any | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarDetalhe() {
      try {
        const res = await fetchApi<any>(`/licitacoes/explorador/${id}`);
        setDetalhe(res);
      } catch (err: any) {
        setErro('Erro ao carregar detalhes da contratação. Ela pode não estar mais disponível no PNCP.');
      } finally {
        setCarregando(false);
      }
    }
    carregarDetalhe();
  }, [id]);

  const handleSalvarNoFunil = async (novoStatus: 'EM_ANALISE' | 'SALVA') => {
    if (!detalhe) return;
    try {
      await fetchApi('/licitacoes/explorador/salvar', {
        method: 'POST',
        body: JSON.stringify({ item: detalhe, status: novoStatus }),
      });
      setDetalhe({ ...detalhe, statusNoFunil: novoStatus });
    } catch (err) {
      console.error('Erro ao salvar edital no funil:', err);
    }
  };

  const formatarData = (dataIso?: string | null) => {
    if (!dataIso) return 'Não informada';
    return new Date(dataIso).toLocaleDateString('pt-BR');
  };

  const formatarMoeda = (valor?: number) => {
    if (!valor) return 'Sob Consulta';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  if (carregando) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Buscando informações no PNCP...</p>
      </div>
    );
  }

  if (erro || !detalhe) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-slate-700 dark:text-slate-300 font-semibold">{erro || 'Contratação não encontrada.'}</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          Voltar para a Busca
        </button>
      </div>
    );
  }

  const tipoDoc = detalhe.tipoDocumento === 'ata' ? 'Ata' : detalhe.tipoDocumento === 'contrato' ? 'Contrato' : 'Edital';
  const titulo = (detalhe.numeroSequencial && detalhe.ano) 
    ? `${tipoDoc} nº ${detalhe.numeroSequencial}/${detalhe.ano}` 
    : `${tipoDoc} - ${detalhe.numeroControlePNCP}`;

  return (
    <div className="space-y-6 pb-12">
      {/* Voltar */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a Busca
      </button>

      {/* Header Principal */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-3 flex-wrap">
            {titulo}
            <span className="px-2.5 py-1 text-xs font-bold bg-slate-900 dark:bg-slate-800 text-white rounded-md">
              {detalhe.numeroControlePNCP}
            </span>
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4" /> Atualizado em: {formatarData(detalhe.dataPublicacaoPncp)}
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <FileText className="w-4 h-4" /> Processo: {detalhe.processo}
            </span>
          </div>
        </div>

        {/* Botões de Ação Superiores */}
        <div className="flex flex-col sm:flex-row gap-3">
          {detalhe.statusNoFunil ? (
            <button
              disabled
              className="px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Bookmark className="w-4 h-4 fill-current" />
              Salvo no Funil ({detalhe.statusNoFunil})
            </button>
          ) : (
            <button
              onClick={() => handleSalvarNoFunil('SALVA')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Bookmark className="w-4 h-4" />
              Salvar Oportunidade
            </button>
          )}

          {detalhe.linkSistemaOrigem && (
            <a
              href={detalhe.linkSistemaOrigem}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              Acessar Contratação Oficial
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Grid Informativo */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Local</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.municipio} - {detalhe.uf}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Órgão</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.orgaoRazaoSocial}</p>
            <p className="text-xs text-slate-500">CNPJ: {detalhe.orgaoCnpj}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Unidade compradora</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.unidadeCompradora}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Modalidade da contratação</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.modalidadeNome}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amparo legal</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.amparoLegal}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.tipo}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Modo de disputa</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.modoDisputa}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registro de preço</p>
            <p className="font-bold text-slate-800 dark:text-slate-200">{detalhe.registroPreco}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Datas e Valores */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Calendar className="w-4 h-4 text-blue-600" /> Prazos e Datas
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 font-medium">Divulgação</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatarData(detalhe.dataPublicacaoPncp)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-slate-500 font-medium">Início Propostas</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatarData(detalhe.dataAberturaProposta)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Fim Recebimento</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatarData(detalhe.dataEncerramentoProposta)}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-5 space-y-2 text-center">
            <p className="text-[11px] font-extrabold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">
              Valor Total Estimado da Compra
            </p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
              {formatarMoeda(detalhe.valorTotalEstimado)}
            </p>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-5 space-y-2 text-center">
            <p className="text-[11px] font-extrabold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider">
              Valor Total Homologado da Compra
            </p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {formatarMoeda(detalhe.valorTotalHomologado)}
            </p>
          </div>
        </div>

        {/* Painel Direito: Objeto da Compra */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-full space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-2 uppercase tracking-wide">
              <FileText className="w-4 h-4 text-blue-600" /> Objeto da Contratação
            </h3>
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {detalhe.objetoCompra}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
