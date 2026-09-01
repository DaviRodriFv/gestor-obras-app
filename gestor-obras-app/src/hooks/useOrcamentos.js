import { useState, useEffect, useCallback } from "react";
import { orcamentosService } from "../services/orcamentosService";

export function useOrcamentos(fornecedorId) {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    if (!fornecedorId) {
      setOrcamentos([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await orcamentosService.listar(fornecedorId);
      setOrcamentos(data);
    } catch {
      setError("Erro ao carregar orçamentos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [fornecedorId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (dto, arquivo) => {
    const novo = await orcamentosService.criar(fornecedorId, dto, arquivo);
    setOrcamentos((prev) => [...prev, novo]);
    return novo;
  };

  const atualizar = async (orcamentoId, dto, arquivo) => {
    const atualizado = await orcamentosService.atualizar(fornecedorId, orcamentoId, dto, arquivo);
    setOrcamentos((prev) => prev.map((o) => (o.id === orcamentoId ? atualizado : o)));
    return atualizado;
  };

  const excluir = async (orcamentoId) => {
    await orcamentosService.excluir(fornecedorId, orcamentoId);
    setOrcamentos((prev) => prev.filter((o) => o.id !== orcamentoId));
  };

  const baixarArquivo = async (orcamentoId, nomeArquivo) => {
    await orcamentosService.baixarArquivo(fornecedorId, orcamentoId, nomeArquivo);
  };

  return {
    orcamentos,
    loading,
    error,
    criar,
    atualizar,
    excluir,
    baixarArquivo,
    recarregar: carregar,
  };
}
