import { useState, useEffect } from "react";
import { Search, HardHat, Loader2, RefreshCw, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import { useObras } from "../../hooks/useObras";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import ObrasTable from "./ObrasTable";
import ObraFormModal from "./ObraFormModal";
import ObraDetailsModal from "./ObraDetailsModal";
import AlterarStatusModal from "./AlterarStatusModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const FILTROS = [
  { label: "Todas", value: "" },
  { label: "Em Andamento", value: "EM_ANDAMENTO" },
  { label: "Pausada", value: "PAUSADA" },
  { label: "Concluída", value: "CONCLUIDA" },
  { label: "Cancelada", value: "CANCELADA" },
];

export default function ObrasPage() {
  const {
    obras,
    loading,
    error,
    setBusca,
    filtroStatus,
    setFiltroStatus,
    criar,
    atualizar,
    alterarStatus,
    excluir,
    recarregar,
  } = useObras();

  const [buscaInput, setBuscaInput] = useState("");
  const [selectedObra, setSelectedObra] = useState(null);

  const [showNovaObra, setShowNovaObra] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAlterarStatus, setShowAlterarStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Debounce de 400ms antes de disparar a requisição
  useEffect(() => {
    const timer = setTimeout(() => setBusca(buscaInput), 400);
    return () => clearTimeout(timer);
  }, [buscaInput, setBusca]);

  function handleSelectObra(obra) {
    setSelectedObra(obra);
    setShowDetails(true);
  }

  function handleOpenEdit() {
    setShowDetails(false);
    setShowEdit(true);
  }

  function handleOpenAlterarStatus() {
    setShowDetails(false);
    setShowAlterarStatus(true);
  }

  function handleOpenDelete() {
    setShowDetails(false);
    setShowDelete(true);
  }

  async function handleCriar(dto) {
    await criar(dto);
  }

  async function handleAtualizar(dto) {
    const atualizada = await atualizar(selectedObra.id, dto);
    setSelectedObra(atualizada);
  }

  async function handleAlterarStatus(novoStatus) {
    const atualizada = await alterarStatus(selectedObra.id, novoStatus);
    setSelectedObra(atualizada);
  }

  async function handleExcluir() {
    await excluir(selectedObra.id);
    setSelectedObra(null);
  }

  return (
    <div className="p-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Obras</h1>
          <p className="text-muted-foreground mt-1">Gerenciar todas as obras cadastradas</p>
        </div>
        <Button onClick={() => setShowNovaObra(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova Obra
        </Button>
      </div>

      {/* Barra de busca */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou cliente..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros por status */}
      <div className="flex items-center gap-1 mb-5">
        {FILTROS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroStatus(f.value)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors font-medium",
              filtroStatus === f.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabela / estados */}
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
          ) : obras.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <HardHat className="w-10 h-10 opacity-30" />
              <p className="text-sm">
                {buscaInput || filtroStatus
                  ? "Nenhuma obra encontrada para os filtros aplicados."
                  : "Nenhuma obra cadastrada."}
              </p>
            </div>
          ) : (
            <ObrasTable obras={obras} onSelect={handleSelectObra} />
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <ObraFormModal
        open={showNovaObra}
        obra={null}
        onClose={() => setShowNovaObra(false)}
        onSave={handleCriar}
      />

      <ObraFormModal
        open={showEdit}
        obra={selectedObra}
        onClose={() => setShowEdit(false)}
        onSave={handleAtualizar}
      />

      <ObraDetailsModal
        open={showDetails}
        obra={selectedObra}
        onClose={() => setShowDetails(false)}
        onEdit={handleOpenEdit}
        onAlterarStatus={handleOpenAlterarStatus}
        onDelete={handleOpenDelete}
      />

      <AlterarStatusModal
        open={showAlterarStatus}
        obra={selectedObra}
        onClose={() => setShowAlterarStatus(false)}
        onConfirm={handleAlterarStatus}
      />

      <ConfirmDeleteModal
        open={showDelete}
        obra={selectedObra}
        onClose={() => setShowDelete(false)}
        onConfirm={handleExcluir}
      />
    </div>
  );
}
