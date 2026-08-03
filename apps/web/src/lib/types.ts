export type UserRole = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'OPERADOR';
export type MatchStatus = 'NOVA' | 'EM_ANALISE' | 'SALVA' | 'DESCARTADA';

export interface Tenant {
  id: string;
  nome: string;
  cnpj: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenant?: Tenant;
}

export interface TermoInteresse {
  id: string;
  tenantId: string;
  termo: string;
  ufs: string[];
  ativo: boolean;
  criadoEm: string;
}

export interface TermoExclusao {
  id: string;
  tenantId: string;
  termo: string;
  ativo: boolean;
  criadoEm: string;
}

export interface Licitacao {
  id: string;
  numeroControlePNCP: string;
  orgaoRazaoSocial: string;
  orgaoCnpj: string;
  uf: string;
  municipio: string;
  modalidadeNome: string;
  objetoCompra: string;
  valorTotalEstimado?: number;
  dataPublicacaoPncp: string;
  dataAberturaProposta?: string;
  dataEncerramentoProposta?: string;
  linkSistemaOrigem?: string;
}

export interface LicitacaoMatch {
  id: string;
  tenantId: string;
  licitacaoId: string;
  status: MatchStatus;
  termosCorrespondentes: string[];
  anotacoes?: string;
  criadoEm: string;
  licitacao: Licitacao;
}

export interface AuditLog {
  id: string;
  acao: string;
  recurso: string;
  ip: string;
  criadoEm: string;
  detalhes?: any;
  user?: {
    nome: string;
    email: string;
  };
}

export interface MetricasFunil {
  NOVA: number;
  EM_ANALISE: number;
  SALVA: number;
  DESCARTADA: number;
  TOTAL: number;
}
