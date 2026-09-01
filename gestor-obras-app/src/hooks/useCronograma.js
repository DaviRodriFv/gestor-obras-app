import { useState, useEffect, useCallback } from "react";
import { cronogramaService } from "../services/cronogramaService";

export function useCronograma(obraId) {
  const [etapas, setEtapas] = useState([]);
  const [progressoGeral, setProgressoGeral] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    if (!obraId) {
      setEtapas([]);
      setProgressoGeral(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await cronogramaService.buscarCronograma(obraId);
      setEtapas(data.etapas);
      setProgressoGeral(data.progressoGeral);
    } catch {
      setError("Erro ao carregar cronograma. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [obraId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (dto) => {
    await cronogramaService.criarEtapa(obraId, dto);
    await carregar();
  };

  const atualizar = async (etapaId, dto) => {
    await cronogramaService.atualizarEtapa(obraId, etapaId, dto);
    await carregar();
  };

  const atualizarProgresso = async (etapaId, dto) => {
    await cronogramaService.atualizarProgresso(obraId, etapaId, dto);
    await carregar();
  };

  const excluir = async (etapaId) => {
    await cronogramaService.excluirEtapa(obraId, etapaId);
    await carregar();
  };

  return {
    etapas,
    progressoGeral,
    loading,
    error,
    criar,
    atualizar,
    atualizarProgresso,
    excluir,
    recarregar: carregar,
  };
}
