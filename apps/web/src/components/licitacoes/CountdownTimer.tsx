'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  dataEncerramento?: string | null;
}

export function CountdownTimer({ dataEncerramento }: CountdownTimerProps) {
  const [tempoRestante, setTempoRestante] = useState<string>('Carregando...');
  const [expirado, setExpirado] = useState<boolean>(false);

  useEffect(() => {
    if (!dataEncerramento) {
      setTempoRestante('Prazo não informado');
      return;
    }

    const atualizarContador = () => {
      const agora = new Date().getTime();
      const encerramento = new Date(dataEncerramento).getTime();
      const diferenca = encerramento - agora;

      if (diferenca <= 0) {
        setTempoRestante('Encerrado');
        setExpirado(true);
        return;
      }

      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));

      if (dias > 0) {
        setTempoRestante(`${dias}d ${horas}h restantes`);
      } else {
        setTempoRestante(`${horas}h ${minutos}m restantes`);
      }
    };

    atualizarContador();
    const interval = setInterval(atualizarContador, 60000);
    return () => clearInterval(interval);
  }, [dataEncerramento]);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
        expirado
          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      }`}
    >
      <Clock className="w-3.5 h-3.5" />
      <span>{tempoRestante}</span>
    </div>
  );
}
