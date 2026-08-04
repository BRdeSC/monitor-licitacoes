"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimiter = exports.loginRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Limite de 5 tentativas de login por IP
    message: {
        erro: 'Muitas tentativas de login a partir deste IP. Por favor, tente novamente após 15 minutos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // Limite de 100 requisições por minuto por IP
    message: {
        erro: 'Limite de requisições excedido. Por favor, aguarde alguns segundos.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
