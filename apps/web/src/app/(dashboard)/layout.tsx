'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { Header } from '../../components/layout/Header';
import { fetchApi } from '../../lib/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchApi('/auth/me')
      .then((data) => setUsuario(data))
      .catch((err) => console.error(err))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400">Carregando ambiente seguro...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar de Navegação */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header usuario={usuario} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
