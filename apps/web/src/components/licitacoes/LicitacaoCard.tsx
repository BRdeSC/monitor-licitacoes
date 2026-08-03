'use client';

import React, { useState } from 'react';
import { LicitacaoMatch, MatchStatus } from '../../lib/types';
import { CountdownTimer } from './CountdownTimer';
import { Building2, MapPin, Tag, ExternalLink, DollarSign, XCircle, Bookmark, Eye, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface LicitacaoCardProps {
  match: LicitacaoMatch;
  onAtualizarStatus: (id: string, novoStatus: MatchStatus) => void;
}

export function LicitacaoCard({ match, onAtualizarStatus }: LicitacaoCardProps) {
  const { licitacao, status, termosCorrespondentes } = match;
  const [expandido, setExpandido] = useState(false);

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

  const objetoLongo = licitacao.objetoCompra.length > 180;
  const objetoTexto = expandido || !objetoLongo ? licitacao.objetoCompra : `${licitacao.objetoCompra.slice(0, 180)}...`;

  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-sm group">
      {/* Top Header: Badges de Modalidade & UF + Contagem Regressiva */}
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {licitacao.modalidadeNome}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {licitacao.uf}
          </span>
        </div>
        <CountdownTimer dataEncerramento={licitacao.dataEncerramentoProposta} />
      </div>

      {/* Dados do Órgão e Objeto */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{licitacao.orgaoRazaoSocial}</span>
        </div>

        <div className="text-slate-100 text-xs sm:text-sm font-semibold leading-relaxed">
          <p>{objetoTexto}</p>
          {objetoLongo && (
            <button
              onClick={() => setExpandido(!expandido)}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 mt-1 focus:outline-none"
            >
              <span>{expandido ? 'Recolher' : 'Ver mais'}</span>
              {expandido ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-400 text-xs pt-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{licitacao.municipio} - {licitacao.uf}</span>
        </div>
      </div>

      {/* Matches e Termos Relevantes */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[10px] text-slate-500 font-semibold uppercase flex items-center gap-1">
          <Tag className="w-3 h-3" /> Termos:
        </span>
        {termosCorrespondentes.map((termo, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium"
          >
            {termo}
          </span>
        ))}
      </div>

      {/* Valor Estimado & Data Limite */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase">Valor Estimado</p>
          <p className="text-sm font-bold text-emerald-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            {formatarMoeda(licitacao.valorTotalEstimado)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-500 font-semibold uppercase flex items-center justify-end gap-1">
            <Calendar className="w-3 h-3" /> Data Limite
          </p>
          <p className="text-xs font-semibold text-slate-300">
            {formatarData(licitacao.dataEncerramentoProposta)}
          </p>
        </div>
      </div>

      {/* Footer com Links e Ações do Funil */}
      <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between gap-2">
        {licitacao.linkSistemaOrigem ? (
          <a
            href={licitacao.linkSistemaOrigem}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-blue-500/30"
          >
            <span>Ver Edital</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
          </a>
        ) : (
          <span className="text-[11px] text-slate-600 font-medium">Link indisponível</span>
        )}

        <div className="flex items-center gap-1.5">
          {status !== 'EM_ANALISE' && (
            <button
              onClick={() => onAtualizarStatus(match.id, 'EM_ANALISE')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Mover para Em Análise"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
            </button>
          )}

          {status !== 'SALVA' && (
            <button
              onClick={() => onAtualizarStatus(match.id, 'SALVA')}
              className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition-colors"
              title="Salvar Oportunidade"
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          )}

          {status !== 'DESCARTADA' && (
            <button
              onClick={() => onAtualizarStatus(match.id, 'DESCARTADA')}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
              title="Descartar Edital"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
