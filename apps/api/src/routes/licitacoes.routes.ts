import { Router } from 'express';
import { LicitacoesController } from '../controllers/licitacoes.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';
import { auditLogMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken, requireTenant);

router.get('/matches', LicitacoesController.listarMatches);
router.get('/metricas', LicitacoesController.obterMetricas);
router.get('/municipios', LicitacoesController.obterMunicipios);
router.patch('/matches/:id/status', auditLogMiddleware('UPDATE_MATCH_STATUS'), LicitacoesController.atualizarStatus);

export default router;
