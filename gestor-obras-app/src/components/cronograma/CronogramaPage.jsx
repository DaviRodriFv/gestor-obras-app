import { useState, useEffect } from "react";
import { CalendarDays, Loader2, RefreshCw, Plus } from "lucide-react";
import { obrasService } from "../../services/obrasService";
import { useCronograma } from "../../hooks/useCronograma";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import EtapasTable from "./EtapasTable";
import EtapaFormModal from "./EtapaFormModal";
import EtapaDetailsModal from "./EtapaDetailsModal";
import AtualizarProgressoModal from "./AtualizarProgressoModal";
import ConfirmDeleteEtapaModal from "./ConfirmDeleteEtapaModal";

export default function CronogramaPage() {
  const [obras, setObras] = useState([]);
  const [obrasLoading, setObrasLoading] = useState(true);
  const [obraId, setObraId] = useState("");

  const {
    etapas,
    progressoGeral,
    loading,
    error,
    criar,
    atualizar,
    atualizarProgresso,
    excluir,
    recarregar,
  } = useCronograma(obraId || null);

  const [selectedEtapa, setSelectedEtapa] = useState(null);
  const [showNovaEtapa, setShowNovaEtapa] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showProgresso, setShowProgresso] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    obrasService
      .listarObras()
      .then(setObras)
      .finally(() => setObrasLoading(false));
  }, []);

  function handleSelectEtapa(etapa) {
    setSelectedEtapa(etapa);
    setShowDetails(true);
  }

  function handleOpenEdit() {
    setShowDetails(false);
    setShowEdit(true);
  }

  function handleOpenProgresso() {
    setShowDetails(false);
    setShowProgresso(true);
  }

  function handleOpenDelete() {
    setShowDetails(false);
    setShowDelete(true);
  }

  async function handleCriar(dto) {
    await criar(dto);
  }

  async function handleAtualizar(dto) {
    await atualizar(selectedEtapa.id, dto);
  }

  async function handleAtualizarProgresso(dto) {
    await atualizarProgresso(selectedEtapa.id, dto);
  }

  async function handleExcluir() {
    await excluir(selectedEtapa.id);
    setSelectedEtapa(null);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cronograma</h1>
          <p className="text-muted-foreground mt-1">Acompanhe as etapas de cada obra</p>
        </div>
        {obraId && (
          <Button onClick={() => setShowNovaEtapa(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Etapa
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-1.5 mb-6 max-w-sm">
        <Label htmlFor="obra">Obra</Label>
        <Select
          id="obra"
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          disabled={obrasLoading}
        >
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
            <CalendarDays className="w-10 h-10 opacity-30" />
            <p className="text-sm">Selecione uma obra para ver o cronograma.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-5">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Progresso Geral</p>
                <p className="text-sm font-semibold text-foreground">{progressoGeral}%</p>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressoGeral}%` }}
                />
              </div>
            </CardContent>
          </Card>

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
              ) : etapas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                  <CalendarDays className="w-10 h-10 opacity-30" />
                  <p className="text-sm">Nenhuma etapa cadastrada para esta obra.</p>
                </div>
              ) : (
                <EtapasTable etapas={etapas} onSelect={handleSelectEtapa} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <EtapaFormModal
        open={showNovaEtapa}
        etapa={null}
        onClose={() => setShowNovaEtapa(false)}
        onSave={handleCriar}
      />

      <EtapaFormModal
        open={showEdit}
        etapa={selectedEtapa}
        onClose={() => setShowEdit(false)}
        onSave={handleAtualizar}
      />

      <EtapaDetailsModal
        open={showDetails}
        etapa={selectedEtapa}
        onClose={() => setShowDetails(false)}
        onEdit={handleOpenEdit}
        onAtualizarProgresso={handleOpenProgresso}
        onDelete={handleOpenDelete}
      />

      <AtualizarProgressoModal
        open={showProgresso}
        etapa={selectedEtapa}
        onClose={() => setShowProgresso(false)}
        onConfirm={handleAtualizarProgresso}
      />

      <ConfirmDeleteEtapaModal
        open={showDelete}
        etapa={selectedEtapa}
        onClose={() => setShowDelete(false)}
        onConfirm={handleExcluir}
      />
    </div>
  );
}
