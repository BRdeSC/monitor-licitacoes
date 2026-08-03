import cron from 'node-cron';
import { ENV } from '../config/env';
import { MatchEngine } from './matchEngine';
import { PNCPProvider } from './providers/PNCPProvider';

export function iniciarCronWorker() {
  console.log(`⏰ [Cron Worker] Agendador iniciado com a expressão: '${ENV.CRON_SCHEDULE}'`);

  // Executa imediatamente na subida do servidor para aquecimento inicial
  MatchEngine.executarIngestaoEMatch([new PNCPProvider()])
    .catch((err) => console.error('Erro na execução inicial do cron:', err));

  // Agenda execuções recorrentes via node-cron
  cron.schedule(ENV.CRON_SCHEDULE, async () => {
    console.log('⏰ [Cron Worker] Disparando execução agendada do robô PNCP...');
    await MatchEngine.executarIngestaoEMatch([new PNCPProvider()]);
  });
}
