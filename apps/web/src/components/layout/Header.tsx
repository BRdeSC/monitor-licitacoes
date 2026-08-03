'use client';

import React from 'react';
import { Bell, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import { fetchApi } from '../../lib/api';

interface HeaderProps {
  usuario?: {
    nome: string;
    email: string;
    tenant?: {
      nome: string;
    };
  };
}

export function Header({ usuario }: HeaderProps) {
  const handleLogout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Nome do Inquilino / Tenant Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>Tenant: {usuario?.tenant?.nome || 'Ambiente Privado'}</span>
        </div>
      </div>

      {/* Perfil & Logout */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 text-slate-400 hover:text-slate-200 transition-colors relative"
          title="Notificações"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
        </button>

        <div className="h-6 w-px bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-semibold text-xs">
            {usuario?.nome ? usuario.nome.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-slate-200">{usuario?.nome || 'Usuário'}</p>
            <p className="text-[11px] text-slate-400">{usuario?.email || 'admin@empresa.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="ml-2 p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800"
          title="Sair do sistema"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
