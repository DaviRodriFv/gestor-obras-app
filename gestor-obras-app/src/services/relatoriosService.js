import api from "./api";

export const relatoriosService = {
  /** Relatório de progresso e financeiro da obra (caso de uso Emitir Relatórios). */
  relatorioObra: async (obraId) => {
    const { data } = await api.get(`/api/obras/${obraId}/relatorio`);
    return data;
  },
};
