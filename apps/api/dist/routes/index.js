"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const termos_routes_1 = __importDefault(require("./termos.routes"));
const licitacoes_routes_1 = __importDefault(require("./licitacoes.routes"));
const lgpd_routes_1 = __importDefault(require("./lgpd.routes"));
const health_controller_1 = require("../controllers/health.controller");
const router = (0, express_1.Router)();
// Rota de Healthcheck (Pública)
router.get('/health', health_controller_1.HealthController.check);
// Sub-rotas da API REST
router.use('/auth', auth_routes_1.default);
router.use('/termos', termos_routes_1.default);
router.use('/licitacoes', licitacoes_routes_1.default);
router.use('/lgpd', lgpd_routes_1.default);
exports.default = router;
