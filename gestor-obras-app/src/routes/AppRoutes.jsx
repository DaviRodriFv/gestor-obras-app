import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login/Login";
import RedefinirSenha from "../pages/RedefinirSenha/RedefinirSenha";
import Dashboard from "../pages/Dashboard/Dashboard";
import Funcionarios from "../pages/Funcionarios/Funcionarios";
import Placeholder from "../pages/Placeholder/Placeholder";
import ObrasPage from "../components/obras/ObrasPage";
import CronogramaPage from "../components/cronograma/CronogramaPage";
import FornecedoresPage from "../components/fornecedores/FornecedoresPage";
import CustosPage from "../components/custos/CustosPage";
import FinanceiroPage from "../components/financeiro/FinanceiroPage";
import RequireRole from "../components/layout/RequireRole";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/redefinir-senha" element={<RedefinirSenha />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="obras" element={<ObrasPage />} />
        <Route path="cronograma" element={<CronogramaPage />} />
        <Route
          path="financeiro"
          element={
            <RequireRole allowedRoles={["ADMINISTRADOR"]}>
              <FinanceiroPage />
            </RequireRole>
          }
        />
        <Route
          path="custos"
          element={
            <RequireRole allowedRoles={["ADMINISTRADOR"]}>
              <CustosPage />
            </RequireRole>
          }
        />
        <Route path="fornecedores" element={<FornecedoresPage />} />
        <Route path="relatorios" element={<Placeholder title="Relatórios" />} />
        <Route
          path="funcionarios"
          element={
            <RequireRole allowedRoles={["ADMINISTRADOR"]}>
              <Funcionarios />
            </RequireRole>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
