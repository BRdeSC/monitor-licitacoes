import { Router } from 'express';
import authRoutes from './auth.routes';
import termosRoutes from './termos.routes';
import licitacoesRoutes from './licitacoes.routes';
import lgpdRoutes from './lgpd.routes';
import { HealthController } from '../controllers/health.controller';

const router = Router();

// Rota de Healthcheck (Pública)
router.get('/health', HealthController.check);

// Sub-rotas da API REST
router.use('/auth', authRoutes);
router.use('/termos', termosRoutes);
router.use('/licitacoes', licitacoesRoutes);
router.use('/lgpd', lgpdRoutes);

export default router;
