"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const health_controller_1 = require("./controllers/health.controller");
const rateLimit_middleware_1 = require("./middlewares/rateLimit.middleware");
const cron_1 = require("./worker/cron");
const app = (0, express_1.default)();
// 1. Cabeçalhos de Segurança (OWASP Helmet)
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
// 2. CORS Restrito ao Frontend (Vercel ou Localhost)
app.use((0, cors_1.default)({
    origin: [env_1.ENV.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3333', 'http://localhost:3334'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// 3. Parsers de Cookies e Body JSON
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 4. Rota pública de Healthcheck (direta e sob /api/health)
app.get('/health', health_controller_1.HealthController.check);
// 5. Global API Rate Limiting
app.use('/api', rateLimit_middleware_1.apiRateLimiter);
// 6. Montagem das Rotas REST
app.use('/api', routes_1.default);
// 7. Rota raiz amigável
app.get('/', (req, res) => {
    res.json({
        sistema: 'API Monitor de Licitações SaaS Multi-tenant',
        versao: '1.0.0',
        status: 'ONLINE',
        documentacao: '/health',
    });
});
// 8. Inicialização do Servidor (escuntando em 0.0.0.0 para Docker) e do Worker Agendado
app.listen(env_1.ENV.PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 API Backend iniciada com sucesso na porta ${env_1.ENV.PORT} (host: 0.0.0.0)`);
    console.log(`🌐 Ambientes: ${env_1.ENV.NODE_ENV}`);
    console.log(`🔒 Seguranca: Helmet + CORS + RateLimit + HTTPOnly Cookie JWT`);
    console.log(`=======================================================`);
    // Inicia o robô assíncrono PNCP em segundo plano
    (0, cron_1.iniciarCronWorker)();
});
