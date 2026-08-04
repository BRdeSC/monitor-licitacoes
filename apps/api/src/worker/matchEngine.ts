import 'dotenv/config';
import { PrismaClient, WorkerStatus } from '@prisma/client';
import { ILicitacaoProvider, LicitacaoDTO } from './providers/ILicitacaoProvider';
import { PNCPProvider } from './providers/PNCPProvider';

const prisma = new PrismaClient();

export class MatchEngine {
  /**
   * Executa a ingestão completa utilizando o endpoint de alta performance /api/search/:
   * 1. Carrega todos os termos de interesse cadastrados pelos tenants ativos
   * 2. Consulta os provedores (ex: PNCP Search API) buscando editais ativos e histórico
   * 3. Salva/Atualiza deduplicado na tabela `Licitacao`
   * 4. Aplica cruzamento ESTRITO de regras (Termos Positivos vs Termos Negativos de Exclusão) por Tenant
   * 5. Grava logs de observabilidade em `WorkerLog`
   */
  static async executarIngestaoEMatch(
    providers: ILicitacaoProvider[] = [new PNCPProvider()],
    termosPersonalizados?: string[]
  ) {
    const inicio = Date.now();
    let totalColetado = 0;
    let novasLicitacoes = 0;
    let novosMatches = 0;
    let erroMensagem: string | undefined = undefined;
    let status: WorkerStatus = WorkerStatus.SUCESSO;

    try {
      // 1. Carrega todos os Tenants ativos com suas palavras de interesse e exclusão
      const tenantsAtivos = await prisma.tenant.findMany({
        where: { ativo: true },
        include: {
          termosInteresse: { where: { ativo: true } },
          termosExclusao: { where: { ativo: true } },
        },
      });

      // Extrai lista única de palavras-chave cadastradas nos tenants
      let termosParaBuscar = new Set<string>();
      if (termosPersonalizados && termosPersonalizados.length > 0) {
        termosPersonalizados.forEach((t) => termosParaBuscar.add(t));
      } else {
        tenantsAtivos.forEach((t) => {
          t.termosInteresse.forEach((ti) => termosParaBuscar.add(ti.termo));
        });
      }

      // Regra de Isolamento: Se nenhum termo ativo estiver cadastrado, CANCELA a ingestão!
      if (termosParaBuscar.size === 0) {
        console.log(`⚠️ [MatchEngine] Nenhum termo de interesse ativo cadastrado nos tenants. Ingestão pausada.`);
        await prisma.workerLog.create({
          data: {
            duracaoMs: Date.now() - inicio,
            status: WorkerStatus.SUCESSO,
            totalColetado: 0,
            novasLicitacoes: 0,
            novosMatches: 0,
            erro: 'Nenhum termo ativo cadastrado nos tenants.',
          },
        });
        return;
      }

      const listaTermos = Array.from(termosParaBuscar);
      console.log(`🚀 [MatchEngine] Iniciando ingestão estrita para os termos: ${listaTermos.join(', ')}`);

      let todasContratacoes: LicitacaoDTO[] = [];
      const statusList = ['recebendo_proposta', 'encerradas'];

      // 2. Itera por cada Provedor e Termo de Interesse dos Tenants
      for (const provider of providers) {
        for (const termo of listaTermos) {
          for (const st of statusList) {
            try {
              const itens = await provider.buscarEditais(termo, undefined, st);
              todasContratacoes = todasContratacoes.concat(itens);
            } catch (e: any) {
              console.warn(`⚠️ [MatchEngine] Falha no provedor ${provider.nome} para o termo "${termo}": ${e.message}`);
              status = WorkerStatus.PARCIAL;
            }
          }
        }
      }

      totalColetado = todasContratacoes.length;
      console.log(`🏢 [MatchEngine] Processando cruzamento estrito para ${tenantsAtivos.length} tenants sobre ${totalColetado} editais coletados...`);

      // 3. Processa cada licitação deduplicando no PostgreSQL
      for (const item of todasContratacoes) {
        const licitacaoSalva = await prisma.licitacao.upsert({
          where: { numeroControlePNCP: item.numeroControlePNCP },
          update: {
            objetoCompra: item.objetoCompra,
            valorTotalEstimado: item.valorTotalEstimado,
            dataEncerramentoProposta: item.dataEncerramentoProposta ? new Date(item.dataEncerramentoProposta) : null,
          },
          create: {
            numeroControlePNCP: item.numeroControlePNCP,
            orgaoRazaoSocial: item.orgaoEntidade.razaoSocial,
            orgaoCnpj: item.orgaoEntidade.cnpj,
            uf: item.unidadeOrgao.ufSigla,
            municipio: item.unidadeOrgao.municipioNome,
            modalidadeNome: item.modalidadeNome,
            tipoDocumento: item.tipoDocumento || 'edital',
            objetoCompra: item.objetoCompra,
            valorTotalEstimado: item.valorTotalEstimado,
            dataPublicacaoPncp: new Date(item.dataPublicacaoPncp),
            dataAberturaProposta: item.dataAberturaProposta ? new Date(item.dataAberturaProposta) : null,
            dataEncerramentoProposta: item.dataEncerramentoProposta ? new Date(item.dataEncerramentoProposta) : null,
            linkSistemaOrigem: item.linkSistemaOrigem,
            rawPayload: item as any,
          },
        });

        novasLicitacoes++;

        // 4. Cruzamento Estrito de Match por Tenant
        const objetoMinusculo = licitacaoSalva.objetoCompra.toLowerCase();
        const ufLicitacao = licitacaoSalva.uf.toUpperCase();

        for (const tenant of tenantsAtivos) {
          // Rule A: Termos de Exclusão do Tenant
          const temExclusao = tenant.termosExclusao.some((excluso: { termo: string }) =>
            objetoMinusculo.includes(excluso.termo.toLowerCase())
          );

          if (temExclusao) {
            continue;
          }

          // Rule B: Termos Positivos de Interesse ATIVOS do Tenant
          const termosMatch = tenant.termosInteresse.filter((interesse: { ufs: string[]; termo: string }) => {
            if (interesse.ufs.length > 0 && !interesse.ufs.includes(ufLicitacao)) {
              return false;
            }
            return objetoMinusculo.includes(interesse.termo.toLowerCase());
          });

          if (termosMatch.length > 0) {
            const termosNomes = termosMatch.map((t: { termo: string }) => t.termo);

            const match = await prisma.licitacaoMatch.upsert({
              where: {
                tenantId_licitacaoId: {
                  tenantId: tenant.id,
                  licitacaoId: licitacaoSalva.id,
                },
              },
              update: {
                termosCorrespondentes: termosNomes,
              },
              create: {
                tenantId: tenant.id,
                licitacaoId: licitacaoSalva.id,
                status: 'NOVA',
                termosCorrespondentes: termosNomes,
              },
            });

            if (match) novosMatches++;
          }
        }
      }

      console.log(`✨ [MatchEngine Finalizado] Coletados: ${totalColetado} | Deduplicados: ${novasLicitacoes} | Novos Matches: ${novosMatches}`);
    } catch (err: any) {
      status = WorkerStatus.FALHA;
      erroMensagem = err.message;
      console.error(`💥 [MatchEngine Erro Crítico]:`, err);
    } finally {
      const duracaoMs = Date.now() - inicio;

      await prisma.workerLog.create({
        data: {
          duracaoMs,
          status,
          totalColetado,
          novasLicitacoes,
          novosMatches,
          erro: erroMensagem,
        },
      });
    }
  }
}
