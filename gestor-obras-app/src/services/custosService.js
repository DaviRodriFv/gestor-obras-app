import api from "./api";

export const custosService = {
  listarCustos: async (obraId, { categoria, status, busca } = {}) => {
    const params = {};
    if (categoria) params.categoria = categoria;
    if (status) params.status = status;
    if (busca) params.busca = busca;
    const { data } = await api.get(`/api/obras/${obraId}/custos`, { params });
    return data;
  },

  buscarCusto: async (obraId, id) => {
    const { data } = await api.get(`/api/obras/${obraId}/custos/${id}`);
    return data;
  },

  criar: async (obraId, dto) => {
    const { data } = await api.post(`/api/obras/${obraId}/custos`, dto);
    return data;
  },

  atualizar: async (obraId, id, dto) => {
    const { data } = await api.put(`/api/obras/${obraId}/custos/${id}`, dto);
    return data;
  },

  atualizarStatus: async (obraId, id, status) => {
    const { data } = await api.patch(`/api/obras/${obraId}/custos/${id}/status`, { status });
    return data;
  },

  excluir: async (obraId, id) => {
    await api.delete(`/api/obras/${obraId}/custos/${id}`);
  },

  porCategoria: async (obraId) => {
    const { data } = await api.get(`/api/obras/${obraId}/custos/por-categoria`);
    return data;
  },
};
