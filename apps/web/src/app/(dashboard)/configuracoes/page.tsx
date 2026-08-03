'use client';

import React, { useEffect, useState } from 'react';
import { TermoInteresse, TermoExclusao } from '../../../lib/types';
import { fetchApi } from '../../../lib/api';
import { Plus, Trash2, Sliders, ShieldCheck, Tag, XCircle, AlertCircle } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [interesses, setInteresses] = useState<TermoInteresse[]>([]);
  const [exclusoes, setExclusoes] = useState<TermoExclusao[]>([]);
  
  const [novoInteresse, setNovoInteresse] = useState('');
  const [ufsInteresse, setUfsInteresse] = useState<string[]>([]);
  
  const [novaExclusao, setNovaExclusao] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const carregarTermos = async () => {
    setCarregando(true);
    try {
      const [resInteresses, resExclusoes] = await Promise.all([
        fetchApi<TermoInteresse[]>('/termos/interesse'),
        fetchApi<TermoExclusao[]>('/termos/exclusao'),
      ]);
      setInteresses(resInteresses);
      setExclusoes(resExclusoes);
    } catch (err) {
      console.error(err);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarTermos();
  }, []);

  const handleAdicionarInteresse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoInteresse.trim()) return;

    try {
      await fetchApi('/termos/interesse', {
        method: 'POST',
        body: JSON.stringify({ termo: novoInteresse, ufs: ufsInteresse }),
      });
      setNovoInteresse('');
      setUfsInteresse([]);
      setMensagem('Palavra-chave de interesse adicionada com sucesso!');
      await carregarTermos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoverInteresse = async (id: string) => {
    try {
      await fetchApi(`/termos/interesse/${id}`, { method: 'DELETE' });
      await carregarTermos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAdicionarExclusao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaExclusao.trim()) return;

    try {
      await fetchApi('/termos/exclusao', {
        method: 'POST',
        body: JSON.stringify({ termo: novaExclusao }),
      });
      setNovaExclusao('');
      setMensagem('Palavra-chave de exclusão adicionada com sucesso!');
      await carregarTermos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRemoverExclusao = async (id: string) => {
    try {
      await fetchApi(`/termos/exclusao/${id}`, { method: 'DELETE' });
      await carregarTermos();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header da Tela */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          Configuração de Interesses & Filtros de Exclusão (Por Tenant)
        </h1>
        <p className="text-xs text-slate-400">
          Cadastre termos positivos para capturar editais relevantes e termos negativos de exclusão para bloquear ofertas indesejadas.
        </p>
      </div>

      {mensagem && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          {mensagem}
        </div>
      )}

      {/* Grid: Termos Positivos vs Termos Negativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BLOCO 1: PALAVRAS-CHAVE POSITIVAS DE INTERESSE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <Tag className="w-4 h-4 text-emerald-400" />
            <h2>Palavras-Chave Positivas (Interesses)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Editais que contiverem qualquer um destes termos no objeto da compra serão capturados pelo robô.
          </p>

          <form onSubmit={handleAdicionarInteresse} className="space-y-3">
            <input
              type="text"
              value={novoInteresse}
              onChange={(e) => setNovoInteresse(e.target.value)}
              placeholder="Ex: água mineral, gás GLP, desenvolvimento software..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            />
            
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Termo de Interesse</span>
            </button>
          </form>

          {/* Lista de Termos Positivos */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Termos Cadastrados ({interesses.length})
            </p>
            {interesses.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum termo positivo cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {interesses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <div>
                      <span className="text-xs font-semibold text-emerald-400">{item.termo}</span>
                      {item.ufs.length > 0 && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Restrito às UFs: {item.ufs.join(', ')}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoverInteresse(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Excluir termo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BLOCO 2: PALAVRAS DE EXCLUSÃO NEGATIVA (FILTRO BLOQUEADOR) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
            <XCircle className="w-4 h-4 text-red-400" />
            <h2>Filtro Negativo (Palavras de Exclusão)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Se o edital contiver qualquer um destes termos no objeto (ex: locação, manutenção), será **desconsiderado** automaticamente.
          </p>

          <form onSubmit={handleAdicionarExclusao} className="space-y-3">
            <input
              type="text"
              value={novaExclusao}
              onChange={(e) => setNovaExclusao(e.target.value)}
              placeholder="Ex: locação, manutenção, medicinal..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
            />
            
            <button
              type="submit"
              className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Termo de Exclusão</span>
            </button>
          </form>

          {/* Lista de Termos Negativos */}
          <div className="space-y-2 pt-2">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Termos de Bloqueio ({exclusoes.length})
            </p>
            {exclusoes.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Nenhum termo de exclusão cadastrado.</p>
            ) : (
              <div className="space-y-2">
                {exclusoes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <span className="text-xs font-semibold text-red-400">{item.termo}</span>
                    <button
                      onClick={() => handleRemoverExclusao(item.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Excluir bloqueio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
