"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function authenticateToken(req, res, next) {
    try {
        // 1. Tenta extrair token do Header Authorization ou do Cookie HTTPOnly
        let token = req.cookies?.accessToken;
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            return res.status(401).json({ erro: 'Não autorizado. Token de acesso ausente.' });
        }
        // 2. Valida o Token JWT
        const decoded = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        if (!decoded || !decoded.userId || !decoded.tenantId) {
            return res.status(401).json({ erro: 'Token inválido ou com payload corrompido.' });
        }
        req.user = decoded;
        req.tenantId = decoded.tenantId;
        return next();
    }
    catch (error) {
        return res.status(401).json({ erro: 'Sessão expirada ou token inválido.', detalhes: error.message });
    }
}
