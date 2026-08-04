"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const matchEngine_1 = require("../worker/matchEngine");
const PNCPProvider_1 = require("../worker/providers/PNCPProvider");
async function run() {
    console.log('🚀 [PNCP High-Performance Search] Iniciando execução do Match Engine...');
    await matchEngine_1.MatchEngine.executarIngestaoEMatch([new PNCPProvider_1.PNCPProvider()]);
    console.log('✅ [PNCP High-Performance Search] Ingestão concluída com sucesso!');
}
run().catch((err) => {
    console.error('❌ Erro durante a ingestão:', err);
    process.exit(1);
});
