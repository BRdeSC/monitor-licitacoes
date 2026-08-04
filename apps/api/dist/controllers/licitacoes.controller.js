"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicitacoesController = void 0;
const licitacoes_service_1 = require("../services/licitacoes.service");
const client_1 = require("@prisma/client");
class LicitacoesController {
    static async listarMatches(req, res) {
        try {
            const tenantId = req.tenantId;
            const { status, tipoDocumento, uf, ufs, municipios, modalidades, orgaos, busca, pagina, limite } = req.query;
            let parsedUfs = undefined;
            if (ufs) {
                parsedUfs = String(ufs).split(',').map((s) => s.trim()).filter(Boolean);
            }
            else if (uf) {
                parsedUfs = [String(uf).trim()];
            }
            let parsedMunicipios = undefined;
            if (municipios) {
                parsedMunicipios = String(municipios).split(',').map((s) => s.trim()).filter(Boolean);
            }
            let parsedModalidades = undefined;
            if (modalidades) {
                parsedModalidades = String(modalidades).split(',').map((s) => s.trim()).filter(Boolean);
            }
            let parsedOrgaos = undefined;
            if (orgaos) {
                parsedOrgaos = String(orgaos).split(',').map((s) => s.trim()).filter(Boolean);
            }
            const resultado = await licitacoes_service_1.LicitacoesService.listarMatches(tenantId, {
                status: status,
                tipoDocumento: tipoDocumento ? String(tipoDocumento) : undefined,
                ufs: parsedUfs,
                municipios: parsedMunicipios,
                modalidades: parsedModalidades,
                orgaos: parsedOrgaos,
                buscaTextual: busca ? String(busca) : undefined,
                pagina: pagina ? parseInt(String(pagina), 10) : 1,
                limite: limite ? parseInt(String(limite), 10) : 12,
            });
            return res.json(resultado);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
    static async obterMunicipios(req, res) {
        try {
            const { uf } = req.query;
            const resultado = await licitacoes_service_1.LicitacoesService.obterMunicipiosPorUf(uf ? String(uf) : undefined);
            return res.json(resultado);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
    static async obterOrgaos(req, res) {
        try {
            const resultado = await licitacoes_service_1.LicitacoesService.obterOrgaos();
            return res.json(resultado);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
    static async atualizarStatus(req, res) {
        try {
            const tenantId = req.tenantId;
            const { id } = req.params;
            const { status, anotacoes } = req.body;
            if (!status || !Object.values(client_1.MatchStatus).includes(status)) {
                return res.status(400).json({
                    erro: `Status inválido. Deve ser um dos seguintes: ${Object.values(client_1.MatchStatus).join(', ')}`,
                });
            }
            const matchAtualizado = await licitacoes_service_1.LicitacoesService.atualizarStatusMatch(tenantId, id, status, anotacoes);
            return res.json(matchAtualizado);
        }
        catch (error) {
            return res.status(400).json({ erro: error.message });
        }
    }
    static async obterMetricas(req, res) {
        try {
            const tenantId = req.tenantId;
            const metricas = await licitacoes_service_1.LicitacoesService.obterMetricasFunil(tenantId);
            return res.json(metricas);
        }
        catch (error) {
            return res.status(500).json({ erro: error.message });
        }
    }
}
exports.LicitacoesController = LicitacoesController;
