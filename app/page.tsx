'use client';

import { useEffect, useState } from 'react';

// Criamos uma interface para que o TypeScript conheça as propriedades da licitação
interface Licitacao {
  numeroControlePNCP: string;
  objetoCompra: string;
  orgaoEntidade: {
    razaoSocial: string;
  };
  unidadeOrgao: {
    municipioNome: string;
    ufSigla: string;
  };
  dataEncerramentoProposta: string;
  modalidadeNome: string;
  valorTotalEstimado: number;
}

export default function Home() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Função assíncrona para buscar os dados do nosso BFF interno
    async function buscarDados() {
      try {
        setCarregando(true);
        const resposta = await fetch('/api/licitacoes');
        
        if (!resposta.ok) {
          throw new Error('Falha ao obter dados da API local');
        }

        const resultado = await resposta.json();
        // Guardamos o array filtrado dentro do nosso estado do React
        setLicitacoes(resultado.licitacoes || []);
      } catch (err: any) {
        setErro(err.message || 'Erro inesperado');
      } finally {
        setCarregando(false);
      }
    }

    buscarDados();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-12 text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabeçalho do Painel */}
        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-blue-700 tracking-tight">
            Monitor de Licitações Públicas
          </h1>
          <p className="mt-2 text-gray-600">
            Monitoramento em tempo real de oportunidades focadas em Água e Gás.
          </p>
        </header>

        {/* Estado de Carregamento (Feedback Visual) */}
        {carregando && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Buscando novas oportunidades no PNCP...</span>
          </div>
        )}

        {/* Estado de Erro */}
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-700 font-medium">Ops! Algo deu errado: {erro}</p>
          </div>
        )}

        {/* Lista de Resultados */}
        {!carregando && !erro && (
          <div>
            {licitacoes.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center text-gray-500">
                Nenhuma nova licitação de água ou gás foi publicada na região hoje.
              </div>
            ) : (
              <div className="grid gap-6">
                {licitacoes.map((licitacao) => (
                  <div 
                    key={licitacao.numeroControlePNCP} 
                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {licitacao.modalidadeNome}
                      </span>
                      <span className="text-sm font-medium text-amber-600">
                        Prazo Limite: {new Date(licitacao.dataEncerramentoProposta).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-gray-800 mb-2">
                      {licitacao.orgaoEntidade.razaoSocial}
                    </h2>

                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {licitacao.objetoCompra}
                    </p>

                    <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
                      <div>
                        📍 Local: <strong className="text-gray-700">{licitacao.unidadeOrgao.municipioNome} - {licitacao.unidadeOrgao.ufSigla}</strong>
                      </div>
                      <div className="mt-2 sm:mt-0 font-semibold text-gray-700">
                        Valor Estimado: {licitacao.valorTotalEstimado ? `R$ ${licitacao.valorTotalEstimado.toLocaleString('pt-BR')}` : 'Não informado'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}