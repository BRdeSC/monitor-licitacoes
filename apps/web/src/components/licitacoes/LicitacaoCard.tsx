'use client';

import React from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface LicitacaoCardProps {
  item: {
    id: string;
    numeroControlePNCP: string;
    numeroSequencial?: string;
    ano?: string;
    orgaoRazaoSocial: string;
    orgaoCnpj?: string;
    uf: string;
    municipio: string;
    modalidadeNome: string;
    tipoDocumento?: string;
    objetoCompra: string;
    valorTotalEstimado?: number;
    dataPublicacaoPncp?: string;
    dataEncerramentoProposta?: string | null;
  };
}

export function LicitacaoCard({ item }: LicitacaoCardProps) {
  const formatarData = (dataIso?: string | null) => {
    if (!dataIso) return 'Não informada';
    return new Date(dataIso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatarMoeda = (valor?: number) => {
    if (!valor) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const valorFormatado = formatarMoeda(item.valorTotalEstimado);
  const tipoDoc = item.tipoDocumento === 'ata' ? 'Ata' : item.tipoDocumento === 'contrato' ? 'Contrato' : 'Edital';
  const titulo = (item.numeroSequencial && item.ano) 
    ? `${tipoDoc} nº ${item.numeroSequencial}/${item.ano}` 
    : `${tipoDoc} - ${item.numeroControlePNCP}`;

  return (
    <Link href={`/dashboard/licitacao/${item.numeroControlePNCP}`} className="block">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-xl p-4.5 transition-all shadow-sm hover:shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer group">
        {/* Informações em Linhas Clean (Estilo Oficial PNCP) */}
        <div className="flex-1 space-y-2 w-full min-w-0">
          {/* Header: Título / ID PNCP */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight text-sm">
              {titulo}
            </span>

            <span className="text-slate-500 dark:text-slate-400 font-medium">
              ID Contratação PNCP: {item.numeroControlePNCP}
            </span>

            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-900 dark:bg-slate-950 text-white dark:text-slate-200 ml-auto md:ml-2">
              {item.uf}
            </span>
          </div>

          {/* Linha 1: Modalidade da Contratação | Data de Atualização */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {item.modalidadeNome}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Publicado em: {formatarData(item.dataPublicacaoPncp)}</span>
            </div>
            {valorFormatado && (
              <>
                <span>•</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                  {valorFormatado}
                </span>
              </>
            )}
          </div>

          {/* Linha 2: Órgão Comprador | Localização (Cidade/UF) */}
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate">{item.orgaoRazaoSocial}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-normal">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{item.municipio} - {item.uf}</span>
            </div>
          </div>

          {/* Linha 3: Objeto da compra resumido */}
          <div className="text-slate-800 dark:text-slate-200 text-xs line-clamp-2 leading-relaxed font-medium">
            {item.objetoCompra}
          </div>
        </div>

        {/* Canto Direito: APENAS a Seta Azul Clicável `>` */}
        <div className="flex items-center justify-center shrink-0 self-end md:self-center pr-2">
          <div className="p-2.5 rounded-xl bg-transparent group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold transition-all flex items-center justify-center">
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
