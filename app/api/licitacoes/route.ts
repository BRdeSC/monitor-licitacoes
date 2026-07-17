import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hoje = new Date();
    const poucosDiasAtras = new Date();
    
    // Mudança estratégica: 4 dias é o equilíbrio perfeito entre volume de dados e estabilidade da API deles
    poucosDiasAtras.setDate(hoje.getDate() - 4);

    const formatarData = (data: Date) => {
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const dia = String(data.getDate()).padStart(2, '0');
      return `${ano}${mes}${dia}`;
    };

    const dataInicialStr = formatarData(poucosDiasAtras);
    const dataFinalStr = formatarData(hoje);
    const uf = 'SP';

    // Mantemos o endpoint /proposta, mas com uma janela de 30 dias de publicação
    const urlPNCP = `https://pncp.gov.br/api/consulta/v1/contratacoes/proposta?dataInicial=${dataInicialStr}&dataFinal=${dataFinalStr}&uf=${uf}&pagina=1`;

    console.log("🔗 BFF buscando editais abertos dos últimos 30 dias:", urlPNCP);

    const resposta = await fetch(urlPNCP, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!resposta.ok) {
      throw new Error(`O servidor do PNCP respondeu com status: ${resposta.status}`);
    }

    const dados = await resposta.json();
    const licitacoesBrutas = dados.data || [];

    // Termos específicos e refinados para o nicho de água e gás (sem o hidrômetro para limpar o ruído!)
    const termosPreferidos = [
      'água mineral', 
      'agua mineral', 
      'garrafão de água', 
      'garrafao de agua',
      'recarga de gás', 
      'recarga de gas', 
      'gás glp', 
      'gas glp', 
      'botijão p13', 
      'botijao p13', 
      'cilindro p45'
    ];

    // Filtra aplicando as regras de negócio
    const licitacoesFiltradas = licitacoesBrutas.filter((licitacao: any) => {
      const objetoMinusculo = (licitacao.objetoCompra || '').toLowerCase();
      return termosPreferidos.some(termo => objetoMinusculo.includes(termo.toLowerCase()));
    });

    return NextResponse.json({
      totalBrutoRecebido: licitacoesBrutas.length,
      totalAposFiltro: licitacoesFiltradas.length,
      licitacoes: licitacoesFiltradas
    });

  } catch (error: any) {
    console.error('❌ ERRO NO TERMINAL:', error.message);
    return NextResponse.json(
      { erro: 'Falha ao conectar com o PNCP', detalhes: error.message },
      { status: 500 }
    );
  }
}