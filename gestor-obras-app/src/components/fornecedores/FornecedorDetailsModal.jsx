import { useState } from "react";
import { Pencil, Trash2, Link2, X, Loader2, FileText, Plus, Paperclip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useOrcamentos } from "../../hooks/useOrcamentos";
import { formatDate, formatCurrency } from "../../utils/format";
import OrcamentoFormModal from "./orcamentos/OrcamentoFormModal";
import OrcamentoDetailsModal from "./orcamentos/OrcamentoDetailsModal";
import ConfirmDeleteOrcamentoModal from "./orcamentos/ConfirmDeleteOrcamentoModal";

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function FornecedorDetailsModal({
  open,
  fornecedor,
  onClose,
  onEdit,
  onDelete,
  onVincularObra,
  onDesvincularObra,
}) {
  const [desvinculando, setDesvinculando] = useState(null);

  const {
    orcamentos,
    loading: loadingOrcamentos,
    criar: criarOrcamento,
    atualizar: atualizarOrcamento,
    excluir: excluirOrcamento,
    baixarArquivo,
  } = useOrcamentos(fornecedor?.id);

  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  const [showNovoOrcamento, setShowNovoOrcamento] = useState(false);
  const [showOrcamentoDetails, setShowOrcamentoDetails] = useState(false);
  const [showOrcamentoEdit, setShowOrcamentoEdit] = useState(false);
  const [showDeleteOrcamento, setShowDeleteOrcamento] = useState(false);

  if (!fornecedor) return null;

  async function handleDesvincular(obraId) {
    setDesvinculando(obraId);
    try {
      await onDesvincularObra(obraId);
    } finally {
      setDesvinculando(null);
    }
  }

  function handleSelectOrcamento(orcamento) {
    setSelectedOrcamento(orcamento);
    setShowOrcamentoDetails(true);
  }

  function handleOpenEditOrcamento() {
    setShowOrcamentoDetails(false);
    setShowOrcamentoEdit(true);
  }

  function handleOpenDeleteOrcamento() {
    setShowOrcamentoDetails(false);
    setShowDeleteOrcamento(true);
  }

  async function handleCriarOrcamento(dto, arquivo) {
    await criarOrcamento(dto, arquivo);
  }

  async function handleAtualizarOrcamento(dto, arquivo) {
    const atualizado = await atualizarOrcamento(selectedOrcamento.id, dto, arquivo);
    setSelectedOrcamento(atualizado);
  }

  async function handleExcluirOrcamento() {
    await excluirOrcamento(selectedOrcamento.id);
    setSelectedOrcamento(null);
  }

  async function handleBaixarArquivo() {
    await baixarArquivo(selectedOrcamento.id, selectedOrcamento.arquivoNome);
  }

  return (
    <Dialog
      open={open && !showNovoOrcamento && !showOrcamentoEdit && !showOrcamentoDetails && !showDeleteOrcamento}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Fornecedor</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <Detail label="Nome / Razão Social" value={fornecedor.nome} />
          <Detail label="Tipo de Serviço" value={fornecedor.tipoServico} />
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Telefone" value={fornecedor.telefone} />
            <Detail label="E-mail" value={fornecedor.email} />
          </div>
          <Detail label="Endereço" value={fornecedor.endereco} />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge variant={fornecedor.ativo ? "default" : "outline"}>
              {fornecedor.ativo ? "Ativo" : "Inativo"}
            </Badge>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                Obras Vinculadas ({fornecedor.obrasVinculadas?.length ?? 0})
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onVincularObra}
                className="flex items-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5" />
                Vincular a Obra
              </Button>
            </div>
            {fornecedor.obrasVinculadas?.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {fornecedor.obrasVinculadas.map((obra) => (
                  <li
                    key={obra.id}
                    className="flex items-center justify-between text-sm bg-muted/50 rounded-md px-3 py-2"
                  >
                    <span className="text-foreground">{obra.nome}</span>
                    <button
                      onClick={() => handleDesvincular(obra.id)}
                      disabled={desvinculando === obra.id}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Desvincular"
                    >
                      {desvinculando === obra.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma obra vinculada.</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">Orçamentos ({orcamentos.length})</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNovoOrcamento(true)}
                className="flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Orçamento
              </Button>
            </div>
            {loadingOrcamentos ? (
              <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : orcamentos.length > 0 ? (
              <ul className="flex flex-col gap-1.5">
                {orcamentos.map((orcamento) => (
                  <li key={orcamento.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectOrcamento(orcamento)}
                      className="flex w-full items-center justify-between gap-2 rounded-md bg-muted/50 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                    >
                      <span className="flex items-center gap-2 text-foreground">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                        {orcamento.obraNome}
                        {orcamento.possuiArquivo && (
                          <Paperclip className="w-3 h-3 shrink-0 text-muted-foreground" />
                        )}
                      </span>
                      <span className="flex items-center gap-3 text-muted-foreground">
                        {formatDate(orcamento.dataOrcamento)}
                        <span className="font-medium text-foreground">
                          {formatCurrency(orcamento.valorTotal)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum orçamento cadastrado.</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex items-center gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir
          </Button>
        </div>
      </DialogContent>

      <OrcamentoFormModal
        open={showNovoOrcamento}
        orcamento={null}
        onClose={() => setShowNovoOrcamento(false)}
        onSave={handleCriarOrcamento}
      />

      <OrcamentoFormModal
        open={showOrcamentoEdit}
        orcamento={selectedOrcamento}
        onClose={() => setShowOrcamentoEdit(false)}
        onSave={handleAtualizarOrcamento}
      />

      <OrcamentoDetailsModal
        open={showOrcamentoDetails}
        orcamento={selectedOrcamento}
        onClose={() => setShowOrcamentoDetails(false)}
        onEdit={handleOpenEditOrcamento}
        onDelete={handleOpenDeleteOrcamento}
        onBaixarArquivo={handleBaixarArquivo}
      />

      <ConfirmDeleteOrcamentoModal
        open={showDeleteOrcamento}
        orcamento={selectedOrcamento}
        onClose={() => setShowDeleteOrcamento(false)}
        onConfirm={handleExcluirOrcamento}
      />
    </Dialog>
  );
}
