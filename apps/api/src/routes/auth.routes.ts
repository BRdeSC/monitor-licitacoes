import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import { auditLogMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.post('/login', loginRateLimiter, auditLogMiddleware('LOGIN_ATTEMPT'), AuthController.login);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.me);

export default router;
