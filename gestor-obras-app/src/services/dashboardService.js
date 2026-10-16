import api from "./api";

export const dashboardService = {
  /** Status de todas as obras: progresso, próximo passo, alertas de prazo (e financeiro, para o administrador). */
  buscarDashboard: async () => {
    const { data } = await api.get("/api/dashboard");
    return data;
  },
};
