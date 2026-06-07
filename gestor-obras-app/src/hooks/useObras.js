import { useState, useEffect, useCallback } from "react";
import { obrasService } from "../services/obrasService";

export function useObras() {
  const [obras, setObras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obrasService.listarObras({ busca, status: filtroStatus });
      setObras(data);
    } catch {
      setError("Erro ao carregar obras. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [busca, filtroStatus]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (dto) => {
    const nova = await obrasService.criarObra(dto);
    setObras((prev) => [...prev, nova]);
    return nova;
  };

  const atualizar = async (id, dto) => {
    const atualizada = await obrasService.atualizarObra(id, dto);
    setObras((prev) => prev.map((o) => (o.id === id ? atualizada : o)));
    return atualizada;
  };

  const alterarStatus = async (id, novoStatus) => {
    const atualizada = await obrasService.alterarStatus(id, novoStatus);
    setObras((prev) => prev.map((o) => (o.id === id ? atualizada : o)));
    return atualizada;
  };

  const excluir = async (id) => {
    await obrasService.excluirObra(id);
    setObras((prev) => prev.filter((o) => o.id !== id));
  };

  return {
    obras,
    loading,
    error,
    busca,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    criar,
    atualizar,
    alterarStatus,
    excluir,
    recarregar: carregar,
  };
}
