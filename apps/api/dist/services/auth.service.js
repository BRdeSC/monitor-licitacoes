"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma = new client_1.PrismaClient();
class AuthService {
    static async login(email, senhaPlana) {
        // 1. Busca usuário por email ativo
        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true },
        });
        if (!user || !user.ativo) {
            throw new Error('Credenciais inválidas ou conta desativada.');
        }
        if (!user.tenant || !user.tenant.ativo) {
            throw new Error('Empresa (Tenant) desativada. Entre em contato com o suporte.');
        }
        // 2. Valida hash da senha
        const senhaValida = await bcryptjs_1.default.compare(senhaPlana, user.senhaHash);
        if (!senhaValida) {
            throw new Error('Credenciais inválidas.');
        }
        // 3. Gera Access Token JWT (Curta Duração)
        const accessTokenPayload = {
            userId: user.id,
            tenantId: user.tenantId,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(accessTokenPayload, env_1.ENV.JWT_SECRET, {
            expiresIn: env_1.ENV.JWT_EXPIRES_IN,
        });
        // 4. Gera Refresh Token JWT (Longa Duração)
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, tenantId: user.tenantId }, env_1.ENV.REFRESH_TOKEN_SECRET, { expiresIn: env_1.ENV.REFRESH_TOKEN_EXPIRES_IN });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
                tenant: {
                    id: user.tenant.id,
                    nome: user.tenant.nome,
                    cnpj: user.tenant.cnpj,
                },
            },
        };
    }
    static async getMe(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nome: true,
                email: true,
                role: true,
                tenantId: true,
                tenant: {
                    select: {
                        id: true,
                        nome: true,
                        cnpj: true,
                    },
                },
            },
        });
        if (!user) {
            throw new Error('Usuário não encontrado.');
        }
        return user;
    }
}
exports.AuthService = AuthService;
