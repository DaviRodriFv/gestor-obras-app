import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  HardHat,
  CalendarDays,
  DollarSign,
  Receipt,
  Truck,
  FileBarChart,
  Users,
  LogOut,
  Building2,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { authService } from "../../services/authService";

const TODOS = ["ADMINISTRADOR", "EQUIPE"];

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: TODOS },
  { to: "/obras", label: "Obras", icon: HardHat, roles: TODOS },
  { to: "/cronograma", label: "Cronograma", icon: CalendarDays, roles: TODOS },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign, roles: TODOS },
  { to: "/custos", label: "Custos", icon: Receipt, roles: TODOS },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck, roles: TODOS },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart, roles: TODOS },
  { to: "/funcionarios", label: "Funcionários", icon: Users, roles: ["ADMINISTRADOR"] },
];

export default function Sidebar() {
  const navigate = useNavigate();

  async function handleLogout() {
    await authService.logout();
    navigate("/login");
  }

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-border flex flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">AP Negócios</p>
          <p className="text-xs text-muted-foreground">Imobiliários</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 flex flex-col gap-1">
        {navItems
          .filter((item) => {
            const user = authService.getUser();
            const cargo = user?.cargo;
            if (!cargo) return false;
            return item.roles?.includes(cargo);
          })
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
