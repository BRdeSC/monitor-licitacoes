import 'dotenv/config';
import { MatchEngine } from '../worker/matchEngine';
import { PNCPProvider } from '../worker/providers/PNCPProvider';

async function run() {
  console.log('🚀 [PNCP High-Performance Search] Iniciando execução do Match Engine...');
  
  await MatchEngine.executarIngestaoEMatch([new PNCPProvider()]);
  
  console.log('✅ [PNCP High-Performance Search] Ingestão concluída com sucesso!');
}

run().catch((err) => {
  console.error('❌ Erro durante a ingestão:', err);
  process.exit(1);
});
