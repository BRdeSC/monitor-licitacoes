"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PNCPClient = void 0;
const PNCPProvider_1 = require("./providers/PNCPProvider");
class PNCPClient {
    static provider = new PNCPProvider_1.PNCPProvider();
    static async buscarEditaisAbertos(termo = 'água', uf) {
        return this.provider.buscarEditais(termo, uf, 'recebendo_proposta');
    }
}
exports.PNCPClient = PNCPClient;
