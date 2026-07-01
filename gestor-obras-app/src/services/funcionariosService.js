import api from "./api";

export const funcionariosService = {
  listarTodos: async () => {
    const { data } = await api.get("/api/funcionarios");
    return data;
  },

  buscarPorId: async (id) => {
    const { data } = await api.get(`/api/funcionarios/${id}`);
    return data;
  },

  criar: async (funcionario) => {
    const { data } = await api.post("/api/funcionarios", funcionario);
    return data;
  },

  atualizar: async (id, funcionario) => {
    const { data } = await api.put(`/api/funcionarios/${id}`, funcionario);
    return data;
  },

  deletar: async (id) => {
    await api.delete(`/api/funcionarios/${id}`);
  },
};
