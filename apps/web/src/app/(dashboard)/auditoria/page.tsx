'use client';

import React, { useEffect, useState } from 'react';
import { AuditLog } from '../../../lib/types';
import { fetchApi } from '../../../lib/api';
import { ShieldCheck, History, User, Laptop } from 'lucide-react';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchApi<AuditLog[]>('/lgpd/audit-logs')
      .then((data) => setLogs(data))
      .catch((err) => console.error(err))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          Rastreabilidade & Audit Logs (Conformidade LGPD)
        </h1>
        <p className="text-xs text-slate-400">
          Registro imutável de acessos, logins e alterações de configurações realizadas no ambiente deste inquilino.
        </p>
      </div>

      {/* Tabela de Audit Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <History className="w-4 h-4 text-blue-400" />
            <span>Últimos Registros de Auditoria</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Total: {logs.length} eventos</span>
        </div>

        {carregando ? (
          <div className="p-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando histórico de auditoria...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Nenhum evento registrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Ação Realizada</th>
                  <th className="py-3 px-4">Recurso / Endpoint</th>
                  <th className="py-3 px-4">Usuário</th>
                  <th className="py-3 px-4">Origem IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {new Date(log.criadoEm).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-400">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {log.acao}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {log.recurso}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.user?.nome || 'Sistema / API'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.ip}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
