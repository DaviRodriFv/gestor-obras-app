import { useState, useEffect, useMemo } from "react";
import { DollarSign, Loader2, RefreshCw, Plus, Pencil } from "lucide-react";
import { obrasService } from "../../services/obrasService";
import { useFinanceiro } from "../../hooks/useFinanceiro";
import { useCustos } from "../../hooks/useCustos";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { CheckboxFilterDropdown } from "../ui/checkbox-filter-dropdown";
import { CATEGORIA_CUSTO_LABELS, CATEGORIA_CUSTO_COLORS, formatCurrency } from "../../utils/format";
import SituacaoBadge from "./SituacaoBadge";
import OrcamentoFormModal from "./OrcamentoFormModal";
import CustosTable from "../custos/CustosTable";
import LancamentoFormModal from "../custos/LancamentoFormModal";
import CustoDetailsModal from "../custos/CustoDetailsModal";
import ConfirmDeleteCustoModal from "../custos/ConfirmDeleteCustoModal";

const CATEGORIA_OPTIONS = Object.entries(CATEGORIA_CUSTO_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function FinanceiroPage() {
  const [obras, setObras] = useState([]);
  const [obrasLoading, setObrasLoading] = useState(true);
  const [obraId, setObraId] = useState("");

  const { dashboard, loading, error, definirOrcamento, recarregar } = useFinanceiro(obraId || null);
  const { custos, atualizarStatus, excluir, recarregar: recarregarCustos } = useCustos(obraId || null);

  const [filtrosCategoria, setFiltrosCategoria] = useState([]);
  const [selectedCusto, setSelectedCusto] = useState(null);

  const [showOrcamento, setShowOrcamento] = useState(false);
  const [showNovoLancamento, setShowNovoLancamento] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    obrasService
      .listarObras()
      .then(setObras)
      .finally(() => setObrasLoading(false));
  }, []);

  const custosFiltrados = useMemo(() => {
    if (filtrosCategoria.length === 0) return custos;
    return custos.filter((c) => filtrosCategoria.includes(c.categoria));
  }, [custos, filtrosCategoria]);

  function handleToggleCategoria(value) {
    setFiltrosCategoria((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  async function handleSalvarOrcamento(valor) {
    await definirOrcamento(valor);
  }

  async function handleSalvoLancamento() {
    await Promise.all([recarregar(), recarregarCustos()]);
  }

  function handleSelectCusto(custo) {
    setSelectedCusto(custo);
    setShowDetails(true);
  }

  function handleOpenEdit() {
    setShowDetails(false);
    setShowEdit(true);
  }

  function handleOpenDelete() {
    setShowDetails(false);
    setShowDelete(true);
  }

  async function handleRegistrarPagamento() {
    await atualizarStatus(selectedCusto.id, "PAGO");
    await recarregar();
    setShowDetails(false);
    setSelectedCusto(null);
  }

  async function handleCancelar() {
    await atualizarStatus(selectedCusto.id, "CANCELADO");
    await recarregar();
    setShowDetails(false);
    setSelectedCusto(null);
  }

  async function handleExcluir() {
    await excluir(selectedCusto.id);
    await recarregar();
    setSelectedCusto(null);
  }

  const semOrcamento = dashboard?.situacao === "SEM_ORCAMENTO";
  const saldoNegativo = dashboard?.saldoRestante != null && dashboard.saldoRestante < 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Acompanhe orçamento e gastos de cada obra</p>
        </div>
        {obraId && (
          <Button onClick={() => setShowNovoLancamento(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mb-6 max-w-sm">
        <Label htmlFor="obra">Obra</Label>
        <Select id="obra" value={obraId} onChange={(e) => setObraId(e.target.value)} disabled={obrasLoading}>
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

            <Card className="mb-5">
              <CardContent className="py-5">
                <p className="text-sm font-medium text-foreground mb-4">Gastos por Categoria</p>
                <div className="flex flex-col gap-4">
                  {CATEGORIA_OPTIONS.map(({ value, label }) => {
                    const item = dashboard.gastosPorCategoria?.find((g) => g.categoria === value);
                    const pct = item?.percentualOrcamento;
                    return (
                      <div key={value}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-2 text-sm text-foreground">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: CATEGORIA_CUSTO_COLORS[value] }}
                            />
                            {label}
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
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-4 mb-5">
              <CheckboxFilterDropdown
                label="Categoria"
                options={CATEGORIA_OPTIONS}
                selected={filtrosCategoria}
                onToggle={handleToggleCategoria}
                className="w-56"
              />
            </div>

            <Card>
              <CardContent className="p-0">
                {custosFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                    <DollarSign className="w-10 h-10 opacity-30" />
                    <p className="text-sm">
                      {filtrosCategoria.length > 0
                        ? "Nenhum lançamento encontrado para o filtro aplicado."
                        : "Nenhum custo lançado para esta obra."}
                    </p>
                  </div>
                ) : (
                  <CustosTable custos={custosFiltrados} onSelect={handleSelectCusto} />
                )}
              </CardContent>
            </Card>
          </>
        )
      )}

      <OrcamentoFormModal
        open={showOrcamento}
        orcamentoAtual={dashboard?.orcamento}
        onClose={() => setShowOrcamento(false)}
        onSave={handleSalvarOrcamento}
      />

      <LancamentoFormModal
        open={showNovoLancamento}
        custo={null}
        obraId={obraId}
        onClose={() => setShowNovoLancamento(false)}
        onSalvo={handleSalvoLancamento}
      />

      <LancamentoFormModal
        open={showEdit}
        custo={selectedCusto}
        obraId={obraId}
        onClose={() => setShowEdit(false)}
        onSalvo={handleSalvoLancamento}
      />

      <CustoDetailsModal
        open={showDetails}
        custo={selectedCusto}
        onClose={() => setShowDetails(false)}
        onEdit={handleOpenEdit}
        onRegistrarPagamento={handleRegistrarPagamento}
        onCancelar={handleCancelar}
        onDelete={handleOpenDelete}
      />

      <ConfirmDeleteCustoModal
        open={showDelete}
        custo={selectedCusto}
        onClose={() => setShowDelete(false)}
        onConfirm={handleExcluir}
      />
    </div>
  );
}
