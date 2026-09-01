import { useState, useMemo } from "react";
import { Search, Truck, Loader2, RefreshCw, Plus } from "lucide-react";
import { useFornecedores } from "../../hooks/useFornecedores";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import FornecedoresTable from "./FornecedoresTable";
import FornecedorFormModal from "./FornecedorFormModal";
import FornecedorDetailsModal from "./FornecedorDetailsModal";
import VincularObraModal from "./VincularObraModal";
import ConfirmDeleteFornecedorModal from "./ConfirmDeleteFornecedorModal";

export default function FornecedoresPage() {
  const {
    fornecedores,
    loading,
    error,
    criar,
    atualizar,
    excluir,
    vincularObra,
    desvincularObra,
    recarregar,
  } = useFornecedores();

  const [busca, setBusca] = useState("");
  const [selectedFornecedor, setSelectedFornecedor] = useState(null);

  const [showNovo, setShowNovo] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showVincular, setShowVincular] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return fornecedores;
    return fornecedores.filter(
      (f) =>
        f.nome.toLowerCase().includes(termo) || f.tipoServico.toLowerCase().includes(termo)
    );
  }, [fornecedores, busca]);

  function handleSelectFornecedor(fornecedor) {
    setSelectedFornecedor(fornecedor);
    setShowDetails(true);
  }

  function handleOpenEdit() {
    setShowDetails(false);
    setShowEdit(true);
  }

  function handleOpenVincular() {
    setShowDetails(false);
    setShowVincular(true);
  }

  function handleOpenDelete() {
    setShowDetails(false);
    setShowDelete(true);
  }

  async function handleCriar(dto) {
    await criar(dto);
  }

  async function handleAtualizar(dto) {
    const atualizado = await atualizar(selectedFornecedor.id, dto);
    setSelectedFornecedor(atualizado);
  }

  async function handleVincular(obraId) {
    const atualizado = await vincularObra(selectedFornecedor.id, obraId);
    setSelectedFornecedor(atualizado);
    setShowDetails(true);
  }

  async function handleDesvincular(obraId) {
    const atualizado = await desvincularObra(selectedFornecedor.id, obraId);
    setSelectedFornecedor(atualizado);
  }

  async function handleExcluir() {
    await excluir(selectedFornecedor.id);
    setSelectedFornecedor(null);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
          <p className="text-muted-foreground mt-1">Gerencie fornecedores e vínculos com obras</p>
        </div>
        <Button onClick={() => setShowNovo(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou tipo de serviço..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

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
          ) : fornecedoresFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Truck className="w-10 h-10 opacity-30" />
              <p className="text-sm">
                {busca ? "Nenhum fornecedor encontrado para a busca." : "Nenhum fornecedor cadastrado."}
              </p>
            </div>
          ) : (
            <FornecedoresTable fornecedores={fornecedoresFiltrados} onSelect={handleSelectFornecedor} />
          )}
        </CardContent>
      </Card>

      <FornecedorFormModal
        open={showNovo}
        fornecedor={null}
        onClose={() => setShowNovo(false)}
        onSave={handleCriar}
      />

      <FornecedorFormModal
        open={showEdit}
        fornecedor={selectedFornecedor}
        onClose={() => setShowEdit(false)}
        onSave={handleAtualizar}
      />

      <FornecedorDetailsModal
        open={showDetails}
        fornecedor={selectedFornecedor}
        onClose={() => setShowDetails(false)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onVincularObra={handleOpenVincular}
        onDesvincularObra={handleDesvincular}
      />

      <VincularObraModal
        open={showVincular}
        fornecedor={selectedFornecedor}
        onClose={() => setShowVincular(false)}
        onConfirm={handleVincular}
      />

      <ConfirmDeleteFornecedorModal
        open={showDelete}
        fornecedor={selectedFornecedor}
        onClose={() => setShowDelete(false)}
        onConfirm={handleExcluir}
      />
    </div>
  );
}
