import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Receipt, Loader2, RefreshCw, Plus, DollarSign } from "lucide-react";
import { obrasService } from "../../services/obrasService";
import { useCustos } from "../../hooks/useCustos";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { CheckboxFilterDropdown } from "../ui/checkbox-filter-dropdown";
import { CATEGORIA_CUSTO_LABELS, STATUS_CUSTO_LABELS, formatCurrency } from "../../utils/format";
import CustosTable from "./CustosTable";
import LancamentoFormModal from "./LancamentoFormModal";
import CustoDetailsModal from "./CustoDetailsModal";
import ConfirmDeleteCustoModal from "./ConfirmDeleteCustoModal";

const CATEGORIA_OPTIONS = Object.entries(CATEGORIA_CUSTO_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const STATUS_OPTIONS = Object.entries(STATUS_CUSTO_LABELS).map(([value, label]) => ({ value, label }));

/**
 * Lançamentos de custo da obra: cadastrar, editar, anexar orçamento/nota, pagar, cancelar e excluir.
 * Os totais e a situação do orçamento ficam na tela Financeiro.
 */
export default function CustosPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const obraId = searchParams.get("obra") ?? "";

  const [obras, setObras] = useState([]);
  const [obrasLoading, setObrasLoading] = useState(true);

  const { custos, loading, error, atualizarStatus, excluir, baixarAnexo, recarregar } = useCustos(
    obraId || null,
  );

  const [busca, setBusca] = useState("");
  // Vindo do Financeiro (clique numa categoria), já abre filtrado
  const [filtrosCategoria, setFiltrosCategoria] = useState(() => {
    const categoria = searchParams.get("categoria");
    return categoria ? [categoria] : [];
  });
  const [filtrosStatus, setFiltrosStatus] = useState([]);
  const [selectedCusto, setSelectedCusto] = useState(null);

  const [showNovo, setShowNovo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    obrasService
      .listarObras()
      .then(setObras)
      .finally(() => setObrasLoading(false));
  }, []);

  function handleSelectObra(id) {
    setSearchParams(id ? { obra: id } : {});
  }

  const custosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return custos.filter((c) => {
      if (termo && !c.descricao.toLowerCase().includes(termo)) return false;
      if (filtrosCategoria.length > 0 && !filtrosCategoria.includes(c.categoria)) return false;
      if (filtrosStatus.length > 0 && !filtrosStatus.includes(c.status)) return false;
      return true;
    });
  }, [custos, busca, filtrosCategoria, filtrosStatus]);

  // Soma dos lançamentos listados (cancelados não contam como gasto)
  const totalListado = useMemo(
    () =>
      custosFiltrados
        .filter((c) => c.status !== "CANCELADO")
        .reduce((soma, c) => soma + Number(c.valor), 0),
    [custosFiltrados],
  );

  function handleToggleCategoria(value) {
    setFiltrosCategoria((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }

  function handleToggleStatus(value) {
    setFiltrosStatus((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
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
    setShowDetails(false);
    setSelectedCusto(null);
  }

  async function handleCancelar() {
    await atualizarStatus(selectedCusto.id, "CANCELADO");
    setShowDetails(false);
    setSelectedCusto(null);
  }

  async function handleReverterParaPendente() {
    await atualizarStatus(selectedCusto.id, "PENDENTE");
    setShowDetails(false);
    setSelectedCusto(null);
  }

  async function handleExcluir() {
    await excluir(selectedCusto.id);
    setSelectedCusto(null);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Custos</h1>
          <p className="text-muted-foreground mt-1">Lançamentos de gastos da obra, com orçamento ou nota anexados</p>
        </div>
        {obraId && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/financeiro?obra=${obraId}`)}
              className="flex items-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Ver resumo financeiro
            </Button>
            <Button onClick={() => setShowNovo(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Novo Lançamento
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
            <Receipt className="w-10 h-10 opacity-30" />
            <p className="text-sm">Selecione uma obra para ver os custos.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9"
                placeholder="Buscar por descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <CheckboxFilterDropdown
              label="Categoria"
              options={CATEGORIA_OPTIONS}
              selected={filtrosCategoria}
              onToggle={handleToggleCategoria}
              className="w-56"
            />
            <CheckboxFilterDropdown
              label="Status"
              options={STATUS_OPTIONS}
              selected={filtrosStatus}
              onToggle={handleToggleStatus}
              className="w-56"
            />
          </div>

          {!loading && !error && custos.length > 0 && (
            <p className="text-sm text-muted-foreground mb-3">
              {custosFiltrados.length} lançamento(s) · {formatCurrency(totalListado)} (sem cancelados)
            </p>
          )}

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Carregando...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={recarregar}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar novamente
                  </Button>
                </div>
              ) : custosFiltrados.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                  <Receipt className="w-10 h-10 opacity-30" />
                  <p className="text-sm">
                    {busca || filtrosCategoria.length > 0 || filtrosStatus.length > 0
                      ? "Nenhum custo encontrado para os filtros aplicados."
                      : "Nenhum custo lançado para esta obra."}
                  </p>
                </div>
              ) : (
                <CustosTable custos={custosFiltrados} onSelect={handleSelectCusto} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <LancamentoFormModal
        open={showNovo}
        custo={null}
        obraId={obraId}
        onClose={() => setShowNovo(false)}
        onSalvo={recarregar}
      />

      <LancamentoFormModal
        open={showEdit}
        custo={selectedCusto}
        obraId={obraId}
        onClose={() => setShowEdit(false)}
        onSalvo={recarregar}
      />

      <CustoDetailsModal
        open={showDetails}
        custo={selectedCusto}
        onClose={() => setShowDetails(false)}
        onEdit={handleOpenEdit}
        onRegistrarPagamento={handleRegistrarPagamento}
        onCancelar={handleCancelar}
        onReverterParaPendente={handleReverterParaPendente}
        onDelete={handleOpenDelete}
        onBaixarAnexo={baixarAnexo}
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
