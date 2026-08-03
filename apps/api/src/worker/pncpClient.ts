import { PNCPProvider } from './providers/PNCPProvider';
import { LicitacaoDTO } from './providers/ILicitacaoProvider';

export type PNCPItemDTO = LicitacaoDTO;

export class PNCPClient {
  private static provider = new PNCPProvider();

  static async buscarEditaisAbertos(termo: string = 'água', uf?: string): Promise<PNCPItemDTO[]> {
    return this.provider.buscarEditais(termo, uf, 'recebendo_proposta');
  }
}
