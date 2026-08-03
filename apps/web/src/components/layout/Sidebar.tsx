'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Sliders, ShieldAlert, FileSearch, Building2 } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Funil de Licitações',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Interesses & Filtros',
      href: '/configuracoes',
      icon: Sliders,
    },
    {
      label: 'Auditoria LGPD',
      href: '/auditoria',
      icon: ShieldAlert,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-800 px-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-wide">MONITOREI</h1>
            <p className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">PNCP SaaS Multi-Tenant</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-300">
            <span>Status do Robô</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-[10px] text-slate-500">Node-Cron ativo na AWS</p>
        </div>
      </div>
    </aside>
  );
}
