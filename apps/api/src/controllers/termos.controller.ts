import { Request, Response } from 'express';
import { TermosService } from '../services/termos.service';

export class TermosController {
  // --- TERMOS DE INTERESSE ---
  static async listarInteresses(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const termos = await TermosService.meustermosInteresse(tenantId);
      return res.json(termos);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  static async criarInteresse(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { termo, ufs } = req.body;

      if (!termo) {
        return res.status(400).json({ erro: 'O termo de interesse é obrigatório.' });
      }

      const novoTermo = await TermosService.adicionarTermoInteresse(tenantId, termo, ufs || []);
      return res.status(201).json(novoTermo);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async removerInteresse(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      await TermosService.removerTermoInteresse(tenantId, id);
      return res.json({ mensagem: 'Termo de interesse removido com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  // --- TERMOS DE EXCLUSÃO ---
  static async listarExclusoes(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const termos = await TermosService.meustermosExclusao(tenantId);
      return res.json(termos);
    } catch (error: any) {
      return res.status(500).json({ erro: error.message });
    }
  }

  static async criarExclusao(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { termo } = req.body;

      if (!termo) {
        return res.status(400).json({ erro: 'O termo de exclusão é obrigatório.' });
      }

      const novoTermo = await TermosService.adicionarTermoExclusao(tenantId, termo);
      return res.status(201).json(novoTermo);
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }

  static async removerExclusao(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId!;
      const { id } = req.params;

      await TermosService.removerExclusao(tenantId, id);
      return res.json({ mensagem: 'Termo de exclusão removido com sucesso.' });
    } catch (error: any) {
      return res.status(400).json({ erro: error.message });
    }
  }
}
