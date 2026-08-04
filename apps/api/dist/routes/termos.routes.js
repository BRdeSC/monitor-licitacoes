"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const termos_controller_1 = require("../controllers/termos.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken, tenant_middleware_1.requireTenant);
// Termos de Interesse (Positivos)
router.get('/interesse', termos_controller_1.TermosController.listarInteresses);
router.post('/interesse', (0, audit_middleware_1.auditLogMiddleware)('CREATE_INTEREST_KEYWORD'), termos_controller_1.TermosController.criarInteresse);
router.delete('/interesse/:id', (0, audit_middleware_1.auditLogMiddleware)('DELETE_INTEREST_KEYWORD'), termos_controller_1.TermosController.removerInteresse);
// Termos de Exclusão (Negativos)
router.get('/exclusao', termos_controller_1.TermosController.listarExclusoes);
router.post('/exclusao', (0, audit_middleware_1.auditLogMiddleware)('CREATE_EXCLUSION_KEYWORD'), termos_controller_1.TermosController.criarExclusao);
router.delete('/exclusao/:id', (0, audit_middleware_1.auditLogMiddleware)('DELETE_EXCLUSION_KEYWORD'), termos_controller_1.TermosController.removerExclusao);
exports.default = router;
