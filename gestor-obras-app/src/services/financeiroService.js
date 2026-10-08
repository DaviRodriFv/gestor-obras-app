import api from "./api";

export const financeiroService = {
  buscarDashboard: async (obraId) => {
    const { data } = await api.get(`/api/obras/${obraId}/financeiro`);
    return data;
  },

  definirOrcamento: async (obraId, valor) => {
    const { data } = await api.put(`/api/obras/${obraId}/orcamento`, { valor });
    return data;
  },
};
