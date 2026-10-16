import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  HardHat,
  CalendarDays,
  Truck,
  Receipt,
  DollarSign,
  FileBarChart,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { dashboardService } from "../../services/dashboardService";
import { authService } from "../../services/authService";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import StatusBadge from "../../components/obras/StatusBadge";
import SituacaoBadge from "../../components/financeiro/SituacaoBadge";
import { formatDate } from "../../utils/format";

const ADMIN = ["ADMINISTRADOR"];
const TODOS = ["ADMINISTRADOR", "EQUIPE"];

const ATALHOS = [
  { to: "/obras", label: "Obras", descricao: "Cadastrar e acompanhar obras", icon: HardHat, roles: TODOS },
  { to: "/cronograma", label: "Cronograma", descricao: "Etapas e progresso", icon: CalendarDays, roles: TODOS },
  { to: "/fornecedores", label: "Fornecedores", descricao: "Fornecedores e orçamentos", icon: Truck, roles: TODOS },
  { to: "/custos", label: "Custos", descricao: "Lançar gastos e anexos", icon: Receipt, roles: ADMIN },
  { to: "/financeiro", label: "Financeiro", descricao: "Orçamento × gasto real", icon: DollarSign, roles: ADMIN },
  { to: "/relatorios", label: "Relatórios", descricao: "Relatório da obra em PDF", icon: FileBarChart, roles: ADMIN },
  { to: "/funcionarios", label: "Funcionários", descricao: "Usuários e permissões", icon: Users, roles: ADMIN },
];

const DIAS_ALERTA_PRAZO = 30;

function textoPrazo(obra) {
  if (obra.diasParaPrazo == null) return formatDate(obra.prazoConclusao);
  if (obra.diasParaPrazo < 0) return `Vencido há ${-obra.diasParaPrazo} dia(s)`;
  if (obra.diasParaPrazo === 0) return "Vence hoje";
  return `${obra.diasParaPrazo} dia(s) · ${formatDate(obra.prazoConclusao)}`;
}

function corPrazo(obra) {
  if (obra.diasParaPrazo == null) return "text-muted-foreground";
  if (obra.diasParaPrazo < 0) return "text-red-400";
  if (obra.diasParaPrazo <= DIAS_ALERTA_PRAZO) return "text-amber-400";
  return "text-muted-foreground";
}

/** Alertas da seção "Atenção": prazo, etapas atrasadas e orçamento (este último só para o administrador). */
function montarAlertas(obras) {
  const alertas = [];
  for (const obra of obras) {
    if (obra.diasParaPrazo != null && obra.diasParaPrazo < 0) {
      alertas.push({ obra, nivel: "erro", texto: `Prazo vencido há ${-obra.diasParaPrazo} dia(s)`, destino: "cronograma" });
    } else if (obra.diasParaPrazo != null && obra.diasParaPrazo <= DIAS_ALERTA_PRAZO) {
      alertas.push({ obra, nivel: "aviso", texto: `Prazo em ${obra.diasParaPrazo} dia(s)`, destino: "cronograma" });
    }
    if (obra.etapasAtrasadas > 0) {
      alertas.push({ obra, nivel: "erro", texto: `${obra.etapasAtrasadas} etapa(s) atrasada(s)`, destino: "cronograma" });
    }
    if (obra.situacaoFinanceira === "ORCAMENTO_EXCEDIDO") {
      alertas.push({ obra, nivel: "erro", texto: "Orçamento excedido", destino: "financeiro" });
    } else if (obra.situacaoFinanceira === "EM_ALERTA") {
      alertas.push({
        obra,
        nivel: "aviso",
        texto: `${Math.round(obra.percentualOrcamentoConsumido ?? 0)}% do orçamento consumido`,
        destino: "financeiro",
      });
    }
  }
  // Erros antes de avisos
  return alertas.sort((a, b) => (a.nivel === b.nivel ? 0 : a.nivel === "erro" ? -1 : 1));
}

function Indicador({ label, valor, detalhe, icon, cor = "text-foreground" }) {
  const Icone = icon;
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <Icone className={`w-4 h-4 ${cor}`} />
        </div>
        <p className={`text-2xl font-semibold ${cor}`}>{valor}</p>
        {detalhe && <p className="text-xs text-muted-foreground mt-0.5">{detalhe}</p>}
      </CardContent>
    </Card>
  );
}

/**
 * Tela inicial: status de todas as obras (% de conclusão, próximos passos e alertas de prazo,
 * como pede o investidor) e atalhos para as demais funções.
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getUser();
  const isAdmin = user?.cargo === "ADMINISTRADOR";

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mostrarEncerradas, setMostrarEncerradas] = useState(false);

  async function carregar() {
    setLoading(true);
    setError("");
    try {
      setDashboard(await dashboardService.buscarDashboard());
    } catch {
      setError("Erro ao carregar o dashboard. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const obrasVisiveis = useMemo(() => {
    if (!dashboard) return [];
    return mostrarEncerradas
      ? dashboard.obras
      : dashboard.obras.filter((o) => o.status === "EM_ANDAMENTO" || o.status === "PAUSADA");
  }, [dashboard, mostrarEncerradas]);

  const alertas = useMemo(() => (dashboard ? montarAlertas(dashboard.obras) : []), [dashboard]);
  const atalhos = ATALHOS.filter((a) => a.roles.includes(user?.cargo));
  const primeiroNome = user?.nome?.trim().split(" ")[0];
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  function abrirAlerta(alerta) {
    navigate(`/${alerta.destino}?obra=${alerta.obra.id}`);
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{primeiroNome ? `Olá, ${primeiroNome}` : "Dashboard"}</h1>
        <p className="text-muted-foreground mt-1 first-letter:uppercase">{hoje} · visão geral das obras</p>
      </div>

      {loading && !dashboard ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={carregar} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      ) : (
        dashboard && (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 ${isAdmin ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
              <Indicador
                label="Obras ativas"
                valor={dashboard.obrasEmAndamento + dashboard.obrasPausadas}
                detalhe={`${dashboard.obrasEmAndamento} em andamento · ${dashboard.obrasPausadas} pausada(s)`}
                icon={HardHat}
              />
              <Indicador
                label="Prazo vencido"
                valor={dashboard.obrasComPrazoVencido}
                detalhe="obra(s) ativas"
                icon={AlertTriangle}
                cor={dashboard.obrasComPrazoVencido > 0 ? "text-red-400" : "text-foreground"}
              />
              <Indicador
                label="Prazo nos próximos 30 dias"
                valor={dashboard.obrasComPrazoProximo}
                detalhe="obra(s) ativas"
                icon={Clock}
                cor={dashboard.obrasComPrazoProximo > 0 ? "text-amber-400" : "text-foreground"}
              />
              <Indicador
                label="Com etapas atrasadas"
                valor={dashboard.obrasComEtapasAtrasadas}
                detalhe={`${dashboard.obrasConcluidas} obra(s) concluída(s) no total`}
                icon={CheckCircle2}
                cor={dashboard.obrasComEtapasAtrasadas > 0 ? "text-red-400" : "text-foreground"}
              />
              {isAdmin && (
                <Indicador
                  label="Orçamento em risco"
                  valor={dashboard.obrasComOrcamentoEmRisco ?? 0}
                  detalhe="em alerta ou excedido"
                  icon={DollarSign}
                  cor={dashboard.obrasComOrcamentoEmRisco > 0 ? "text-amber-400" : "text-foreground"}
                />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <Card className="lg:col-span-2">
                <CardContent className="py-5">
                  <p className="text-sm font-medium text-foreground mb-3">Atenção</p>
                  {alertas.length === 0 ? (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Nenhum alerta: prazos, etapas{isAdmin ? " e orçamentos" : ""} em dia.
                    </p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-border">
                      {alertas.slice(0, 6).map((alerta, i) => (
                        <li key={`${alerta.obra.id}-${i}`}>
                          <button
                            type="button"
                            onClick={() => abrirAlerta(alerta)}
                            className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-muted/40 rounded-md px-2 -mx-2 transition-colors"
                          >
                            <span className="flex items-center gap-2.5 min-w-0">
                              <AlertTriangle
                                className={`w-4 h-4 shrink-0 ${alerta.nivel === "erro" ? "text-red-400" : "text-amber-400"}`}
                              />
                              <span className="text-sm text-foreground truncate">{alerta.obra.nome}</span>
                              <span className="text-sm text-muted-foreground shrink-0">— {alerta.texto}</span>
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {alertas.length > 6 && (
                    <p className="text-xs text-muted-foreground mt-2">e mais {alertas.length - 6} alerta(s) na lista de obras abaixo.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-5">
                  <p className="text-sm font-medium text-foreground mb-3">Acesso rápido</p>
                  <div className="grid grid-cols-2 gap-2">
                    {atalhos.map((atalho) => (
                      <button
                        key={atalho.to}
                        type="button"
                        onClick={() => navigate(atalho.to)}
                        className="flex flex-col items-start gap-1 rounded-md border border-border px-3 py-2.5 text-left hover:bg-muted/40 transition-colors"
                      >
                        <atalho.icon className="w-4 h-4 text-foreground" />
                        <span className="text-sm font-medium text-foreground">{atalho.label}</span>
                        <span className="text-[11px] leading-tight text-muted-foreground">{atalho.descricao}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="py-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <p className="text-sm font-medium text-foreground">
                    {mostrarEncerradas ? "Todas as obras" : "Obras ativas"}
                  </p>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mostrarEncerradas}
                      onChange={(e) => setMostrarEncerradas(e.target.checked)}
                    />
                    Mostrar concluídas e canceladas
                  </label>
                </div>

                {obrasVisiveis.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                    <HardHat className="w-10 h-10 opacity-30" />
                    <p className="text-sm">
                      {dashboard.totalObras === 0 ? "Nenhuma obra cadastrada ainda." : "Nenhuma obra ativa no momento."}
                    </p>
                    {dashboard.totalObras === 0 && (
                      <Button size="sm" onClick={() => navigate("/obras")}>
                        Cadastrar obra
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="font-medium py-2 pr-4">Obra</th>
                          <th className="font-medium py-2 pr-4">Status</th>
                          <th className="font-medium py-2 pr-4 w-48">Conclusão</th>
                          <th className="font-medium py-2 pr-4">Próximo passo</th>
                          <th className="font-medium py-2 pr-4">Prazo</th>
                          {isAdmin && <th className="font-medium py-2">Financeiro</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {obrasVisiveis.map((obra) => (
                          <tr
                            key={obra.id}
                            onClick={() => navigate(`/cronograma?obra=${obra.id}`)}
                            className="border-t border-border cursor-pointer hover:bg-muted/40 transition-colors"
                            title="Abrir cronograma da obra"
                          >
                            <td className="py-2.5 pr-4">
                              <p className="font-medium text-foreground">{obra.nome}</p>
                              <p className="text-xs text-muted-foreground">{obra.cliente}</p>
                            </td>
                            <td className="py-2.5 pr-4">
                              <StatusBadge status={obra.status} />
                            </td>
                            <td className="py-2.5 pr-4">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full bg-primary" style={{ width: `${obra.progressoGeral}%` }} />
                                </div>
                                <span className="text-xs text-foreground w-9 text-right">{obra.progressoGeral}%</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {obra.totalEtapas === 0
                                  ? "sem etapas"
                                  : `${obra.totalEtapas} etapa(s)${obra.etapasAtrasadas > 0 ? ` · ${obra.etapasAtrasadas} atrasada(s)` : ""}`}
                              </p>
                            </td>
                            <td className="py-2.5 pr-4 text-muted-foreground">
                              {obra.proximaEtapa ? (
                                <>
                                  <p className="text-foreground">{obra.proximaEtapa}</p>
                                  <p className="text-[11px]">previsto {formatDate(obra.proximaEtapaInicio)}</p>
                                </>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className={`py-2.5 pr-4 ${corPrazo(obra)}`}>{textoPrazo(obra)}</td>
                            {isAdmin && (
                              <td className="py-2.5">
                                {obra.situacaoFinanceira ? <SituacaoBadge situacao={obra.situacaoFinanceira} /> : "—"}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
}
