import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env';
import routes from './routes';
import { HealthController } from './controllers/health.controller';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';
import { iniciarCronWorker } from './worker/cron';

const app = express();

// 1. Cabeçalhos de Segurança (OWASP Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// 2. CORS Restrito ao Frontend (Vercel ou Localhost)
app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3333', 'http://localhost:3334'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Parsers de Cookies e Body JSON
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Rota pública de Healthcheck (direta e sob /api/health)
app.get('/health', HealthController.check);

// 5. Global API Rate Limiting
app.use('/api', apiRateLimiter);

// 6. Montagem das Rotas REST
app.use('/api', routes);

// 7. Rota raiz amigável
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    sistema: 'API Monitor de Licitações SaaS Multi-tenant',
    versao: '1.0.0',
    status: 'ONLINE',
    documentacao: '/health',
  });
});

// 8. Inicialização do Servidor (escuntando em 0.0.0.0 para Docker) e do Worker Agendado
app.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 API Backend iniciada com sucesso na porta ${ENV.PORT} (host: 0.0.0.0)`);
  console.log(`🌐 Ambientes: ${ENV.NODE_ENV}`);
  console.log(`🔒 Seguranca: Helmet + CORS + RateLimit + HTTPOnly Cookie JWT`);
  console.log(`=======================================================`);

  // Inicia o robô assíncrono PNCP em segundo plano
  iniciarCronWorker();
});
