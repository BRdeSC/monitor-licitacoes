import { Router } from 'express';
import { TermosController } from '../controllers/termos.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireTenant } from '../middlewares/tenant.middleware';
import { auditLogMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.use(authenticateToken, requireTenant);

// Termos de Interesse (Positivos)
router.get('/interesse', TermosController.listarInteresses);
router.post('/interesse', auditLogMiddleware('CREATE_INTEREST_KEYWORD'), TermosController.criarInteresse);
router.delete('/interesse/:id', auditLogMiddleware('DELETE_INTEREST_KEYWORD'), TermosController.removerInteresse);

// Termos de Exclusão (Negativos)
router.get('/exclusao', TermosController.listarExclusoes);
router.post('/exclusao', auditLogMiddleware('CREATE_EXCLUSION_KEYWORD'), TermosController.criarExclusao);
router.delete('/exclusao/:id', auditLogMiddleware('DELETE_EXCLUSION_KEYWORD'), TermosController.removerExclusao);

export default router;
