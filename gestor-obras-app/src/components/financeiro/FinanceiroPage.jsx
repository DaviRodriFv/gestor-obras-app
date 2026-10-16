import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DollarSign, Loader2, RefreshCw, Pencil, Receipt, FileBarChart } from "lucide-react";
import { obrasService } from "../../services/obrasService";
import { useFinanceiro } from "../../hooks/useFinanceiro";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { CATEGORIA_CUSTO_LABELS, CATEGORIA_CUSTO_COLORS, formatCurrency } from "../../utils/format";
import SituacaoBadge from "./SituacaoBadge";
import OrcamentoFormModal from "./OrcamentoFormModal";
import GastosPorCategoriaChart from "./GastosPorCategoriaChart";

const CATEGORIA_OPTIONS = Object.entries(CATEGORIA_CUSTO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

/**
 * Painel financeiro da obra: teto de gasto, total gasto, saldo, situação e gasto por categoria.
 * Só leitura — os lançamentos são feitos na tela Custos (botão "Ver lançamentos").
 */
export default function FinanceiroPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const obraId = searchParams.get("obra") ?? "";

  const [obras, setObras] = useState([]);
  const [obrasLoading, setObrasLoading] = useState(true);
  const [showOrcamento, setShowOrcamento] = useState(false);

  const { dashboard, loading, error, definirOrcamento, recarregar } = useFinanceiro(obraId || null);

  useEffect(() => {
    obrasService
      .listarObras()
      .then(setObras)
      .finally(() => setObrasLoading(false));
  }, []);

  function handleSelectObra(id) {
    setSearchParams(id ? { obra: id } : {});
  }

  function abrirLancamentos(categoria) {
    const params = new URLSearchParams({ obra: obraId });
    if (categoria) params.set("categoria", categoria);
    navigate(`/custos?${params}`);
  }

  const semOrcamento = dashboard?.situacao === "SEM_ORCAMENTO";
  const saldoNegativo = dashboard?.saldoRestante != null && dashboard.saldoRestante < 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Orçamento previsto × gasto real de cada obra</p>
        </div>
        {obraId && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => abrirLancamentos()} className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Ver lançamentos
            </Button>
            {/* <<extend>> Emitir Relatórios */}
            <Button onClick={() => navigate(`/relatorios/obra/${obraId}`)} className="flex items-center gap-2">
              <FileBarChart className="w-4 h-4" />
              Emitir relatório
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mb-6 max-w-sm">
        <Label htmlFor="obra">Obra</Label>
        <Select id="obra" value={obraId} onChange={(e) => handleSelectObra(e.target.value)} disabled={obrasLoading}>
          <option value="">Selecione uma obra...</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.nome}
            </option>
          ))}
        </Select>
      </div>

      {!obraId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <DollarSign className="w-10 h-10 opacity-30" />
            <p className="text-sm">Selecione uma obra para ver o resumo financeiro.</p>
          </CardContent>
        </Card>
      ) : loading && !dashboard ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={recarregar} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      ) : (
        dashboard && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <SituacaoBadge situacao={dashboard.situacao} />
              {semOrcamento && (
                <p className="text-sm text-amber-400">
                  Defina um orçamento para acompanhar o consumo desta obra.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-muted-foreground">Orçamento Total</p>
                    <button
                      onClick={() => setShowOrcamento(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Definir/editar orçamento"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {dashboard.orcamento != null ? formatCurrency(dashboard.orcamento) : "—"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground mb-1.5">Total Gasto</p>
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(dashboard.totalGasto)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground mb-1.5">Saldo Restante</p>
                  <p
                    className={`text-lg font-semibold ${
                      saldoNegativo ? "text-destructive" : "text-foreground"
                    }`}
                  >
                    {dashboard.saldoRestante != null ? formatCurrency(dashboard.saldoRestante) : "—"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs text-muted-foreground">Percentual Consumido</p>
                    <p className="text-xs font-semibold text-foreground">
                      {dashboard.percentualConsumido != null
                        ? `${Math.round(dashboard.percentualConsumido)}%`
                        : "—"}
                    </p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        dashboard.situacao === "ORCAMENTO_EXCEDIDO"
                          ? "bg-destructive"
                          : dashboard.situacao === "EM_ALERTA"
                            ? "bg-amber-500"
                            : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(dashboard.percentualConsumido ?? 0, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardContent className="py-5">
                  <p className="text-sm font-medium text-foreground mb-1">Gastos por Categoria</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Percentual em relação ao orçamento da obra. Clique numa categoria para ver os lançamentos.
                  </p>
                  <div className="flex flex-col gap-4">
                    {CATEGORIA_OPTIONS.map(({ value, label }) => {
                      const item = dashboard.gastosPorCategoria?.find((g) => g.categoria === value);
                      const pct = item?.percentualOrcamento;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => abrirLancamentos(value)}
                          className="text-left rounded-md -mx-2 px-2 py-1 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="flex items-center gap-2 text-sm text-foreground">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: CATEGORIA_CUSTO_COLORS[value] }}
                              />
                              {label}
                              <span className="text-xs text-muted-foreground">
                                ({item?.quantidade ?? 0} lançamento(s))
                              </span>
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(item?.total ?? 0)}
                              {pct != null && ` · ${Math.round(pct)}%`}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${Math.min(pct ?? 0, 100)}%`,
                                backgroundColor: CATEGORIA_CUSTO_COLORS[value],
                              }}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="py-5">
                  <p className="text-sm font-medium text-foreground mb-2">Distribuição do Gasto</p>
                  <GastosPorCategoriaChart
                    dados={dashboard.gastosPorCategoria ?? []}
                    onSelectCategoria={abrirLancamentos}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )
      )}

      <OrcamentoFormModal
        open={showOrcamento}
        orcamentoAtual={dashboard?.orcamento}
        onClose={() => setShowOrcamento(false)}
        onSave={definirOrcamento}
      />
    </div>
  );
}
