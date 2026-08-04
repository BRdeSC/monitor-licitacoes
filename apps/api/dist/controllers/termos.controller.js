"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermosController = void 0;
const termos_service_1 = require("../services/termos.service");
class TermosController {
    // --- TERMOS DE INTERESSE ---
    static async listarInteresses(req, res) {
        try {
            const tenantId = req.tenantId;
            const termos = await termos_service_1.TermosService.meustermosInteresse(tenantId);
            return res.json(termos);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
    static async criarInteresse(req, res) {
        try {
            const tenantId = req.tenantId;
            const { termo, ufs } = req.body;
            if (!termo) {
                return res.status(400).json({ erro: 'O termo de interesse é obrigatório.' });
            }
            const novoTermo = await termos_service_1.TermosService.adicionarTermoInteresse(tenantId, termo, ufs || []);
            return res.status(201).json(novoTermo);
        }
        catch (error) {
            return res.status(400).json({ erro: error.message });
        }
    }
    static async removerInteresse(req, res) {
        try {
            const tenantId = req.tenantId;
            const { id } = req.params;
            await termos_service_1.TermosService.removerTermoInteresse(tenantId, id);
            return res.json({ mensagem: 'Termo de interesse removido com sucesso.' });
        }
        catch (error) {
            return res.status(400).json({ erro: error.message });
        }
    }
    // --- TERMOS DE EXCLUSÃO ---
    static async listarExclusoes(req, res) {
        try {
            const tenantId = req.tenantId;
            const termos = await termos_service_1.TermosService.meustermosExclusao(tenantId);
            return res.json(termos);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
    static async criarExclusao(req, res) {
        try {
            const tenantId = req.tenantId;
            const { termo } = req.body;
            if (!termo) {
                return res.status(400).json({ erro: 'O termo de exclusão é obrigatório.' });
            }
            const novoTermo = await termos_service_1.TermosService.adicionarTermoExclusao(tenantId, termo);
            return res.status(201).json(novoTermo);
        }
        catch (error) {
            return res.status(400).json({ erro: error.message });
        }
    }
    static async removerExclusao(req, res) {
        try {
            const tenantId = req.tenantId;
            const { id } = req.params;
            await termos_service_1.TermosService.removerExclusao(tenantId, id);
            return res.json({ mensagem: 'Termo de exclusão removido com sucesso.' });
        }
        catch (error) {
            return res.status(400).json({ erro: error.message });
        }
    }
}
exports.TermosController = TermosController;
