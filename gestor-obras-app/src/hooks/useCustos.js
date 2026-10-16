import { useState, useEffect, useCallback } from "react";
import { custosService } from "../services/custosService";

export function useCustos(obraId) {
  const [custos, setCustos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    if (!obraId) {
      setCustos([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setCustos(await custosService.listarCustos(obraId));
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

  const baixarAnexo = (custo) => custosService.baixarArquivo(obraId, custo.id, custo.anexoNome);

  return {
    custos,
    loading,
    error,
    atualizarStatus,
    excluir,
    baixarAnexo,
    recarregar: carregar,
  };
}
