"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarBlocosDeData = gerarBlocosDeData;
/**
 * Divide qualquer intervalo retroativo total (ex: 15, 30, 60, 90 dias) em sub-blocos
 * de no máximo `maxDiasPorBloco` (padrão 14 dias) para respeitar o limite do PNCP (HTTP 400).
 */
function gerarBlocosDeData(diasRetroativosTotal = 30, maxDiasPorBloco = 14) {
    const blocos = [];
    const hoje = new Date();
    // Data inicial mais antiga (ex: 30 dias atrás)
    const inicioGlobal = new Date();
    inicioGlobal.setDate(hoje.getDate() - diasRetroativosTotal);
    const formatarYYYYMMDD = (d) => {
        const ano = d.getFullYear();
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const dia = String(d.getDate()).padStart(2, '0');
        return `${ano}${mes}${dia}`;
    };
    let atual = new Date(inicioGlobal);
    while (atual <= hoje) {
        const proxima = new Date(atual);
        proxima.setDate(atual.getDate() + maxDiasPorBloco - 1);
        const dataFimBloco = proxima > hoje ? new Date(hoje) : proxima;
        blocos.push({
            dataInicialStr: formatarYYYYMMDD(atual),
            dataFinalStr: formatarYYYYMMDD(dataFimBloco),
        });
        if (dataFimBloco >= hoje) {
            break;
        }
        // Avança 1 dia após o fim do bloco atual
        const proximoInicio = new Date(dataFimBloco);
        proximoInicio.setDate(dataFimBloco.getDate() + 1);
        atual = proximoInicio;
    }
    return blocos;
}
