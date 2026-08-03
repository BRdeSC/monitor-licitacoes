import { Router } from 'express';
import { LgpdController } from '../controllers/lgpd.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';

const router = Router();

router.use(authenticateToken);

// Visualizar logs de auditoria do próprio tenant
router.get('/audit-logs', requireTenant, LgpdController.listarLogsAuditoria);

// Direto ao Esquecimento (Expurgo de Tenant - Apenas Super Admin)
router.delete('/forget/:tenantId', LgpdController.expurgarDadosTenant);

export default router;
