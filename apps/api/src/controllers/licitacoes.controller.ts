import { Request, Response } from 'express';
import { LicitacoesService } from '../services/licitacoes.service';
import { MatchStatus } from '@prisma/client';

export class LicitacoesController {
  static async listarMatches(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { status, uf, ufs, municipios, busca, pagina, limite } = req.query;

      let parsedUfs: string[] | undefined = undefined;
      if (ufs) {
        parsedUfs = String(ufs).split(',').map((s) => s.trim()).filter(Boolean);
      } else if (uf) {
        parsedUfs = [String(uf).trim()];
      }

      let parsedMunicipios: string[] | undefined = undefined;
      if (municipios) {
        parsedMunicipios = String(municipios).split(',').map((s) => s.trim()).filter(Boolean);
      }

      const resultado = await LicitacoesService.listarMatches(tenantId, {
        status: status as MatchStatus,
        ufs: parsedUfs,
        municipios: parsedMunicipios,
        buscaTextual: busca ? String(busca) : undefined,
        pagina: pagina ? parseInt(String(pagina), 10) : 1,
        limite: limite ? parseInt(String(limite), 10) : 12,
      });

      return res.json(resultado);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  static async obterMunicipios(req: Request, res: Response) {
    try {
      const { uf } = req.query;
      const resultado = await LicitacoesService.obterMunicipiosPorUf(uf ? String(uf) : undefined);
      return res.json(resultado);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  static async atualizarStatus(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;
      const { status, anotacoes } = req.body;

      if (!status || !Object.values(MatchStatus).includes(status)) {
        return res.status(400).json({
          erro: `Status inválido. Deve ser um dos seguintes: ${Object.values(MatchStatus).join(', ')}`,
        });
      }

      const matchAtualizado = await LicitacoesService.atualizarStatusMatch(
        tenantId,
        id,
        status as MatchStatus,
        anotacoes
      );

      return res.json(matchAtualizado);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async obterMetricas(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const metricas = await LicitacoesService.obterMetricasFunil(tenantId);
      return res.json(metricas);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }
}
