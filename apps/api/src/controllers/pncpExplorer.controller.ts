import { Request, Response } from 'express';
import { PncpExplorerService } from '../services/pncpExplorer.service';
import { PncpFiltersService } from '../services/pncpFilters.service';

export class PncpExplorerController {
  static async explorar(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const {
        q,
        tipoDocumento,
        status,
        ufs,
        municipios,
        modalidades,
        orgaos,
        unidades,
        esferas,
        poderes,
        fontesOrcamentarias,
        margensPreferencia,
        conteudoNacional,
        emendaParlamentar,
        pagina,
        tamPagina,
      } = req.query;

      const parseArray = (val: any) => {
        if (!val) return undefined;
        return String(val).split(',').map((s) => s.trim()).filter(Boolean);
      };

      const resultado = await PncpExplorerService.explorarPNCP(tenantId, {
        q: q ? String(q) : undefined,
        tipoDocumento: tipoDocumento ? String(tipoDocumento) : 'edital',
        status: status ? String(status) : 'recebendo_proposta',
        ufs: parseArray(ufs),
        municipios: parseArray(municipios),
        modalidades: parseArray(modalidades),
        orgaos: parseArray(orgaos),
        unidades: parseArray(unidades),
        esferas: parseArray(esferas),
        poderes: parseArray(poderes),
        fontesOrcamentarias: parseArray(fontesOrcamentarias),
        margensPreferencia: parseArray(margensPreferencia),
        conteudoNacional: parseArray(conteudoNacional),
        emendaParlamentar: parseArray(emendaParlamentar),
        pagina: pagina ? parseInt(String(pagina), 10) : 1,
        tamPagina: tamPagina ? parseInt(String(tamPagina), 10) : 10,
      });

      return res.json(resultado);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  static async salvarItem(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { item, status } = req.body;

      if (!item || !item.numeroControlePNCP) {
        return res.status(400).json({ erro: 'Dados da licitação inválidos ou sem numeroControlePNCP.' });
      }

      const match = await PncpExplorerService.salvarNoFunil(tenantId, item, status || 'SALVA');
      return res.json(match);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  static async obterFiltros(req: Request, res: Response) {
    try {
      const filtros = await PncpFiltersService.obterFiltrosOficiais();
      return res.json(filtros);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  static async obterPorId(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const id = req.params.id;
      
      if (!id) {
        return res.status(400).json({ erro: 'ID da licitação não informado.' });
      }

      const detalhe = await PncpExplorerService.obterPorId(tenantId, id);
      if (!detalhe) {
        return res.status(404).json({ erro: 'Licitação não encontrada no PNCP Oficial.' });
      }
      
      return res.json(detalhe);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }
}
