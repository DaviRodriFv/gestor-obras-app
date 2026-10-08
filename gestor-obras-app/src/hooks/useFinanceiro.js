import { useState, useEffect, useCallback } from "react";
import { financeiroService } from "../services/financeiroService";

export function useFinanceiro(obraId) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    if (!obraId) {
      setDashboard(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await financeiroService.buscarDashboard(obraId);
      setDashboard(data);
    } catch {
      setError("Erro ao carregar o resumo financeiro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [obraId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const definirOrcamento = async (valor) => {
    const data = await financeiroService.definirOrcamento(obraId, valor);
    setDashboard(data);
  };

  return {
    dashboard,
    loading,
    error,
    definirOrcamento,
    recarregar: carregar,
  };
}
