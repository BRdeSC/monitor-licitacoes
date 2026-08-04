"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const licitacoes_controller_1 = require("../controllers/licitacoes.controller");
const pncpExplorer_controller_1 = require("../controllers/pncpExplorer.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const tenant_middleware_1 = require("../middlewares/tenant.middleware");
const audit_middleware_1 = require("../middlewares/audit.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken, tenant_middleware_1.requireTenant);
// Explorador Global do PNCP (API Direta Oficial 9.990+ itens)
router.get('/explorador', pncpExplorer_controller_1.PncpExplorerController.explorar);
router.get('/explorador/filtros', pncpExplorer_controller_1.PncpExplorerController.obterFiltros);
router.get('/explorador/:id', pncpExplorer_controller_1.PncpExplorerController.obterPorId);
router.post('/explorador/salvar', (0, audit_middleware_1.auditLogMiddleware)('SAVE_EXPLORER_MATCH'), pncpExplorer_controller_1.PncpExplorerController.salvarItem);
// Funil de Licitações do Tenant
router.get('/matches', licitacoes_controller_1.LicitacoesController.listarMatches);
router.get('/metricas', licitacoes_controller_1.LicitacoesController.obterMetricas);
router.get('/municipios', licitacoes_controller_1.LicitacoesController.obterMunicipios);
router.get('/orgaos', licitacoes_controller_1.LicitacoesController.obterOrgaos);
router.patch('/matches/:id/status', (0, audit_middleware_1.auditLogMiddleware)('UPDATE_MATCH_STATUS'), licitacoes_controller_1.LicitacoesController.atualizarStatus);
exports.default = router;
