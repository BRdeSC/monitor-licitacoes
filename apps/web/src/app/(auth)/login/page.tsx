'use client';

import React, { useState } from 'react';
import { FileSearch, Lock, Mail, AlertCircle } from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });

      // Redireciona para o dashboard privado
      window.location.href = '/dashboard';
    } catch (err: any) {
      setErro(err.message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/25">
            <FileSearch className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">MONITOREI LICITAÇÕES</h1>
          <p className="text-xs text-slate-400">
            Acesso Restrito ao Painel Privado de Oportunidades (MVP Fechado)
          </p>
        </div>

        {/* Feedback de Erro */}
        {erro && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário de Autenticação */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              E-mail Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@empresa.com.br"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-2.5 rounded-xl text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {carregando ? 'Validando Acesso...' : 'Entrar no Sistema'}
          </button>
        </form>

        {/* Footer Strict Compliance LGPD Info (SEM BOTAO DE CADASTRO PUBLICO) */}
        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Sistema Multi-tenant Fechado (Invite-Only). Cadastros de novos inquilinos e usuários são realizados estritamente pela equipe de administração.
          </p>
        </div>
      </div>
    </div>
  );
}
