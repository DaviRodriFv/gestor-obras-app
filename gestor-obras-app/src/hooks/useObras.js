import { useState, useEffect, useCallback, useMemo } from "react";
import { obrasService } from "../services/obrasService";

export function useObras() {
  const [obrasRaw, setObrasRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtrosStatus, setFiltrosStatus] = useState([]);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obrasService.listarObras({ busca });
      setObrasRaw(data);
    } catch {
      setError("Erro ao carregar obras. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const obras = useMemo(() => {
    if (filtrosStatus.length === 0) return obrasRaw;
    return obrasRaw.filter((o) => filtrosStatus.includes(o.status));
  }, [obrasRaw, filtrosStatus]);

  const criar = async (dto) => {
    const nova = await obrasService.criarObra(dto);
    setObrasRaw((prev) => [...prev, nova]);
    return nova;
  };

  const atualizar = async (id, dto) => {
    const atualizada = await obrasService.atualizarObra(id, dto);
    setObrasRaw((prev) => prev.map((o) => (o.id === id ? atualizada : o)));
    return atualizada;
  };

  const alterarStatus = async (id, novoStatus) => {
    const atualizada = await obrasService.alterarStatus(id, novoStatus);
    setObrasRaw((prev) => prev.map((o) => (o.id === id ? atualizada : o)));
    return atualizada;
  };

  const excluir = async (id) => {
    await obrasService.excluirObra(id);
    setObrasRaw((prev) => prev.filter((o) => o.id !== id));
  };

  return {
    obras,
    loading,
    error,
    busca,
    setBusca,
    filtrosStatus,
    setFiltrosStatus,
    criar,
    atualizar,
    alterarStatus,
    excluir,
    recarregar: carregar,
  };
}
