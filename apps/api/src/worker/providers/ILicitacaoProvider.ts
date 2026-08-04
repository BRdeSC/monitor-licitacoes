export interface LicitacaoDTO {
  numeroControlePNCP: string;
  orgaoEntidade: {
    razaoSocial: string;
    cnpj: string;
  };
  unidadeOrgao: {
    ufSigla: string;
    municipioNome: string;
  };
  modalidadeNome: string;
  tipoDocumento?: string; // 'edital' | 'ata' | 'contrato'
  objetoCompra: string;
  valorTotalEstimado?: number;
  dataPublicacaoPncp: string;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  linkSistemaOrigem?: string;
}

export interface ILicitacaoProvider {
  readonly nome: string;
  buscarEditais(termo: string, uf?: string, status?: string, tipoDocumento?: string): Promise<LicitacaoDTO[]>;
}
