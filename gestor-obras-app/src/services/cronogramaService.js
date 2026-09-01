import api from "./api";

export const cronogramaService = {
  buscarCronograma: async (obraId) => {
    const { data } = await api.get(`/api/obras/${obraId}/cronograma`);
    return data;
  },

  criarEtapa: async (obraId, dto) => {
    const { data } = await api.post(`/api/obras/${obraId}/cronograma/etapas`, dto);
    return data;
  },

  atualizarEtapa: async (obraId, etapaId, dto) => {
    const { data } = await api.put(`/api/obras/${obraId}/cronograma/etapas/${etapaId}`, dto);
    return data;
  },

  atualizarProgresso: async (obraId, etapaId, dto) => {
    const { data } = await api.patch(
      `/api/obras/${obraId}/cronograma/etapas/${etapaId}/progresso`,
      dto,
    );
    return data;
  },

  excluirEtapa: async (obraId, etapaId) => {
    await api.delete(`/api/obras/${obraId}/cronograma/etapas/${etapaId}`);
  },
};
