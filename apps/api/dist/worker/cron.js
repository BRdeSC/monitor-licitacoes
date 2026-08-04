"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.iniciarCronWorker = iniciarCronWorker;
const node_cron_1 = __importDefault(require("node-cron"));
const env_1 = require("../config/env");
const matchEngine_1 = require("./matchEngine");
const PNCPProvider_1 = require("./providers/PNCPProvider");
function iniciarCronWorker() {
    console.log(`⏰ [Cron Worker] Agendador iniciado com a expressão: '${env_1.ENV.CRON_SCHEDULE}'`);
    // Executa imediatamente na subida do servidor para aquecimento inicial
    matchEngine_1.MatchEngine.executarIngestaoEMatch([new PNCPProvider_1.PNCPProvider()])
        .catch((err) => console.error('Erro na execução inicial do cron:', err));
    // Agenda execuções recorrentes via node-cron
    node_cron_1.default.schedule(env_1.ENV.CRON_SCHEDULE, async () => {
        console.log('⏰ [Cron Worker] Disparando execução agendada do robô PNCP...');
        await matchEngine_1.MatchEngine.executarIngestaoEMatch([new PNCPProvider_1.PNCPProvider()]);
    });
}
