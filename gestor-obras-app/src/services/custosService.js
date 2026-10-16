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

  /** Anexa (ou substitui) o arquivo do lançamento — PDF ou imagem do orçamento/nota. */
  anexarArquivo: async (obraId, id, arquivo) => {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    const { data } = await api.put(`/api/obras/${obraId}/custos/${id}/anexo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  removerArquivo: async (obraId, id) => {
    const { data } = await api.delete(`/api/obras/${obraId}/custos/${id}/anexo`);
    return data;
  },

  baixarArquivo: async (obraId, id, nomeArquivo) => {
    const response = await api.get(`/api/obras/${obraId}/custos/${id}/anexo`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo ?? "anexo";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
