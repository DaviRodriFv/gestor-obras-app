import api from "./api";

export const fornecedoresService = {
  listarTodos: async () => {
    const { data } = await api.get("/api/fornecedores");
    return data;
  },

  buscarPorId: async (id) => {
    const { data } = await api.get(`/api/fornecedores/${id}`);
    return data;
  },

  criar: async (dto) => {
    const { data } = await api.post("/api/fornecedores", dto);
    return data;
  },

  atualizar: async (id, dto) => {
    const { data } = await api.put(`/api/fornecedores/${id}`, dto);
    return data;
  },

  excluir: async (id) => {
    await api.delete(`/api/fornecedores/${id}`);
  },

  vincularObra: async (id, obraId) => {
    const { data } = await api.post(`/api/fornecedores/${id}/obras/${obraId}`);
    return data;
  },

  desvincularObra: async (id, obraId) => {
    const { data } = await api.delete(`/api/fornecedores/${id}/obras/${obraId}`);
    return data;
  },
};
