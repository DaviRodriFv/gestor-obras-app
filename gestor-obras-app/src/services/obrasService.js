import api from "./api";

export const obrasService = {
  listarObras: async ({ busca, status } = {}) => {
    const params = {};
    if (busca) params.busca = busca;
    if (status) params.status = status;
    const { data } = await api.get("/api/obras", { params });
    return data;
  },

  buscarObra: async (id) => {
    const { data } = await api.get(`/api/obras/${id}`);
    return data;
  },

  criarObra: async (dto) => {
    const { data } = await api.post("/api/obras", dto);
    return data;
  },

  atualizarObra: async (id, dto) => {
    const { data } = await api.put(`/api/obras/${id}`, dto);
    return data;
  },

  alterarStatus: async (id, novoStatus) => {
    const { data } = await api.patch(`/api/obras/${id}/status`, { status: novoStatus });
    return data;
  },

  excluirObra: async (id) => {
    await api.delete(`/api/obras/${id}`);
  },
};
