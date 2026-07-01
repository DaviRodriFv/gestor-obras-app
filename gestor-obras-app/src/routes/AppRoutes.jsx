import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Funcionarios from "../pages/Funcionarios/Funcionarios";
import Placeholder from "../pages/Placeholder/Placeholder";
import ObrasPage from "../components/obras/ObrasPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="obras" element={<ObrasPage />} />
        <Route path="cronograma" element={<Placeholder title="Cronograma" />} />
        <Route path="financeiro" element={<Placeholder title="Financeiro" />} />
        <Route path="custos" element={<Placeholder title="Custos" />} />
        <Route
          path="fornecedores"
          element={<Placeholder title="Fornecedores" />}
        />
        <Route path="relatorios" element={<Placeholder title="Relatórios" />} />
        <Route path="funcionarios" element={<Funcionarios />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
