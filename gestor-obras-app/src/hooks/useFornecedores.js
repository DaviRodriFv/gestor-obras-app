import { useState, useEffect, useCallback } from "react";
import { fornecedoresService } from "../services/fornecedoresService";

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fornecedoresService.listarTodos();
      setFornecedores(data);
    } catch {
      setError("Erro ao carregar fornecedores. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (dto) => {
    const novo = await fornecedoresService.criar(dto);
    setFornecedores((prev) => [...prev, novo]);
    return novo;
  };

  const atualizar = async (id, dto) => {
    const atualizado = await fornecedoresService.atualizar(id, dto);
    setFornecedores((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
    return atualizado;
  };

  const excluir = async (id) => {
    await fornecedoresService.excluir(id);
    setFornecedores((prev) => prev.filter((f) => f.id !== id));
  };

  const vincularObra = async (id, obraId) => {
    const atualizado = await fornecedoresService.vincularObra(id, obraId);
    setFornecedores((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
    return atualizado;
  };

  const desvincularObra = async (id, obraId) => {
    const atualizado = await fornecedoresService.desvincularObra(id, obraId);
    setFornecedores((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
    return atualizado;
  };

  return {
    fornecedores,
    loading,
    error,
    criar,
    atualizar,
    excluir,
    vincularObra,
    desvincularObra,
    recarregar: carregar,
  };
}
