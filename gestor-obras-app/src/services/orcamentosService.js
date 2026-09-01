import api from "./api";

function buildFormData(dto, arquivo) {
  const formData = new FormData();
  formData.append("dados", new Blob([JSON.stringify(dto)], { type: "application/json" }));
  if (arquivo) formData.append("arquivo", arquivo);
  return formData;
}

export const orcamentosService = {
  listar: async (fornecedorId) => {
    const { data } = await api.get(`/api/fornecedores/${fornecedorId}/orcamentos`);
    return data;
  },

  buscarPorId: async (fornecedorId, orcamentoId) => {
    const { data } = await api.get(`/api/fornecedores/${fornecedorId}/orcamentos/${orcamentoId}`);
    return data;
  },

  criar: async (fornecedorId, dto, arquivo) => {
    const { data } = await api.post(
      `/api/fornecedores/${fornecedorId}/orcamentos`,
      buildFormData(dto, arquivo)
    );
    return data;
  },

  atualizar: async (fornecedorId, orcamentoId, dto, arquivo) => {
    const { data } = await api.put(
      `/api/fornecedores/${fornecedorId}/orcamentos/${orcamentoId}`,
      buildFormData(dto, arquivo)
    );
    return data;
  },

  excluir: async (fornecedorId, orcamentoId) => {
    await api.delete(`/api/fornecedores/${fornecedorId}/orcamentos/${orcamentoId}`);
  },

  baixarArquivo: async (fornecedorId, orcamentoId, nomeArquivo) => {
    const response = await api.get(
      `/api/fornecedores/${fornecedorId}/orcamentos/${orcamentoId}/arquivo`,
      { responseType: "blob" }
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = nomeArquivo ?? "orcamento.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
