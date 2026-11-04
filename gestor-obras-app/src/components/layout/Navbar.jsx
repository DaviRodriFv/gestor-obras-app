import { useEffect, useRef, useState } from "react";
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
  ChevronDown,
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
  { to: "/financeiro", label: "Financeiro", icon: DollarSign, roles: ["ADMINISTRADOR"] },
  { to: "/custos", label: "Custos", icon: Receipt, roles: ["ADMINISTRADOR"] },
  { to: "/fornecedores", label: "Fornecedores", icon: Truck, roles: TODOS },
  // O relatório da obra traz dados financeiros, então segue a mesma regra do Financeiro
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart, roles: ["ADMINISTRADOR"] },
  { to: "/funcionarios", label: "Funcionários", icon: Users, roles: ["ADMINISTRADOR"] },
];

const VISIBLE_ITEMS = 4;

export default function Navbar() {
  const user = authService.getUser();
  const cargo = user?.cargo;
  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);

  const allowedItems = navItems.filter((item) => cargo && item.roles.includes(cargo));
  const visibleItems = allowedItems.slice(0, VISIBLE_ITEMS);
  const overflowItems = allowedItems.slice(VISIBLE_ITEMS);

  useEffect(() => {
    if (!moreOpen) return;

    function handleClickOutside(event) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setMoreOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  return (
    <header className="sticky top-0 z-20 w-full border-b border-border bg-card">
      <div className="flex min-h-16 items-center gap-4 px-6 py-3">
        <img src={logo} alt="André Paulino Negócios Imobiliários" className="h-10 w-auto shrink-0" />

        <nav className="flex flex-1 items-center gap-1 min-w-0 overflow-visible">
          {visibleItems.map(({ to, label, icon: Icon }) => (
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

          {overflowItems.length > 0 && (
            <div ref={moreMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMoreOpen((open) => !open)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  moreOpen
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                Mais
                <ChevronDown className="h-4 w-4 shrink-0" />
              </button>

              {moreOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-md border border-border bg-card shadow-lg">
                  {overflowItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors",
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
                </div>
              )}
            </div>
          )}
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
