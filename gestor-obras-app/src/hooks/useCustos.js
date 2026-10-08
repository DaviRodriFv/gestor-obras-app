import { useState, useEffect, useCallback } from "react";
import { custosService } from "../services/custosService";

export function useCustos(obraId) {
  const [custos, setCustos] = useState([]);
  const [porCategoria, setPorCategoria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    if (!obraId) {
      setCustos([]);
      setPorCategoria([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [listaCustos, resumo] = await Promise.all([
        custosService.listarCustos(obraId),
        custosService.porCategoria(obraId),
      ]);
      setCustos(listaCustos);
      setPorCategoria(resumo);
    } catch {
      setError("Erro ao carregar custos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [obraId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const atualizarStatus = async (id, status) => {
    await custosService.atualizarStatus(obraId, id, status);
    await carregar();
  };

  const excluir = async (id) => {
    await custosService.excluir(obraId, id);
    await carregar();
  };

  return {
    custos,
    porCategoria,
    loading,
    error,
    atualizarStatus,
    excluir,
    recarregar: carregar,
  };
}
