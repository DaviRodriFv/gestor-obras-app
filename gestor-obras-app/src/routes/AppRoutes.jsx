import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login/Login";
import RedefinirSenha from "../pages/RedefinirSenha/RedefinirSenha";
import Dashboard from "../pages/Dashboard/Dashboard";
import Funcionarios from "../pages/Funcionarios/Funcionarios";
import Placeholder from "../pages/Placeholder/Placeholder";
import ObrasPage from "../components/obras/ObrasPage";
import RequireRole from "../components/layout/RequireRole";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <RequireRole allowedRoles={["Equipe"]}>
              <Dashboard />
            </RequireRole>
          }
        />
        <Route
          path="obras"
          element={
            <RequireRole allowedRoles={["Equipe"]}>
              <ObrasPage />
            </RequireRole>
          }
        />
        <Route
          path="cronograma"
          element={
            <RequireRole allowedRoles={["Equipe"]}>
              <Placeholder title="Cronograma" />
            </RequireRole>
          }
        />
        <Route
          path="financeiro"
          element={
            <RequireRole allowedRoles={["Equipe", "Proprietario"]}>
              <Placeholder title="Financeiro" />
            </RequireRole>
          }
        />
        <Route
          path="custos"
          element={
            <RequireRole allowedRoles={["Equipe"]}>
              <Placeholder title="Custos" />
            </RequireRole>
          }
        />
        <Route
          path="fornecedores"
          element={
            <RequireRole allowedRoles={["Equipe"]}>
              <Placeholder title="Fornecedores" />
            </RequireRole>
          }
        />
        <Route
          path="relatorios"
          element={
            <RequireRole allowedRoles={["Equipe"]}>
              <Placeholder title="Relatórios" />
            </RequireRole>
          }
        />
        <Route
          path="funcionarios"
          element={
            <RequireRole allowedRoles={["Equipe"]}>
              <Funcionarios />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
