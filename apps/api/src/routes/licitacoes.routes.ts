import { Router } from 'express';
import { LicitacoesController } from '../controllers/licitacoes.controller';
import { PncpExplorerController } from '../controllers/pncpExplorer.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';
import { auditLogMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken, requireTenant);

// Explorador Global do PNCP (API Direta Oficial 9.990+ itens)
router.get('/explorador', PncpExplorerController.explorar);
router.get('/explorador/filtros', PncpExplorerController.obterFiltros);
router.get('/explorador/:id', PncpExplorerController.obterPorId);
router.post('/explorador/salvar', auditLogMiddleware('SAVE_EXPLORER_MATCH'), PncpExplorerController.salvarItem);

// Funil de Licitações do Tenant
router.get('/matches', LicitacoesController.listarMatches);
router.get('/metricas', LicitacoesController.obterMetricas);
router.get('/municipios', LicitacoesController.obterMunicipios);
router.get('/orgaos', LicitacoesController.obterOrgaos);
router.patch('/matches/:id/status', auditLogMiddleware('UPDATE_MATCH_STATUS'), LicitacoesController.atualizarStatus);

export default router;
