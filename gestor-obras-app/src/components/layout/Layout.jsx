import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { authService } from "../../services/authService";

export default function Layout() {
  const isAuth = authService.getUser();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
