import api from "./api";

export const authService = {
  login: async (email, senha) => {
    const { data } = await api.post("/api/auth/login", { email, senha });
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  },

  logout: async () => {
    await api.post("/api/auth/logout");
    localStorage.removeItem("user");
  },

  redefinirSenha: async (email, novaSenha) => {
    const { data } = await api.post("/api/auth/redefinir-senha", {
      email,
      novaSenha,
    });
    return data;
  },

  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
