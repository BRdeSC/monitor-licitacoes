"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const env_1 = require("../config/env");
class AuthController {
    static async login(req, res) {
        try {
            const { email, senha } = req.body;
            if (!email || !senha) {
                return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
            }
            const resultado = await auth_service_1.AuthService.login(email, senha);
            // Define cookie HTTPOnly seguro com o Token de Acesso
            res.cookie('accessToken', resultado.accessToken, {
                httpOnly: true,
                secure: env_1.ENV.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000, // 15 min
            });
            // Define cookie HTTPOnly seguro com o Refresh Token
            res.cookie('refreshToken', resultado.refreshToken, {
                httpOnly: true,
                secure: env_1.ENV.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
            });
            return res.json({
                mensagem: 'Login realizado com sucesso.',
                token: resultado.accessToken,
                usuario: resultado.user,
            });
        }
        catch (error) {
            return res.status(401).json({ erro: error.message });
        }
    }
    static async logout(req, res) {
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.json({ mensagem: 'Sessão encerrada com sucesso.' });
    }
    static async me(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                return res.status(401).json({ erro: 'Não autenticado.' });
            const usuario = await auth_service_1.AuthService.getMe(userId);
            return res.json(usuario);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}
exports.AuthController = AuthController;
