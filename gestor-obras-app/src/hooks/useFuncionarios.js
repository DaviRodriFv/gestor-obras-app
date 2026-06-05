import { useState, useEffect, useCallback } from "react";
import { funcionariosService } from "../services/funcionariosService";

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await funcionariosService.listarTodos();
      setFuncionarios(data);
    } catch {
      setError("Erro ao carregar funcionários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (dados) => {
    const novo = await funcionariosService.criar(dados);
    setFuncionarios((prev) => [...prev, novo]);
    return novo;
  };

  const atualizar = async (id, dados) => {
    const atualizado = await funcionariosService.atualizar(id, dados);
    setFuncionarios((prev) => prev.map((f) => (f.id === id ? atualizado : f)));
    return atualizado;
  };

  const deletar = async (id) => {
    await funcionariosService.deletar(id);
    setFuncionarios((prev) => prev.filter((f) => f.id !== id));
  };

  return { funcionarios, loading, error, criar, atualizar, deletar, recarregar: carregar };
}
