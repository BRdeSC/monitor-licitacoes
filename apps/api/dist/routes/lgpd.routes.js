"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lgpd_controller_1 = require("../controllers/lgpd.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
// Visualizar logs de auditoria do próprio tenant
router.get('/audit-logs', tenant_middleware_1.requireTenant, lgpd_controller_1.LgpdController.listarLogsAuditoria);
// Direto ao Esquecimento (Expurgo de Tenant - Apenas Super Admin)
router.delete('/forget/:tenantId', lgpd_controller_1.LgpdController.expurgarDadosTenant);
exports.default = router;
