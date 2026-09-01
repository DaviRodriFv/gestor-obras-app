import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  HardHat,
  CalendarDays,
  DollarSign,
  Receipt,
  Truck,
  FileBarChart,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { authService } from "../../services/authService";
import logo from "../../assets/logo.png";
import UserMenu from "./UserMenu";

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

export default function Navbar() {
  const user = authService.getUser();
  const cargo = user?.cargo;

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border bg-card">
      <div className="flex h-16 items-center gap-6 px-6">
        <img src={logo} alt="André Paulino Negócios Imobiliários" className="h-10 w-auto shrink-0" />

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {navItems
            .filter((item) => cargo && item.roles.includes(cargo))
            .map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
