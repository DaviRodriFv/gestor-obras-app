import { Pencil, TrendingUp, Trash2 } from "lucide-react";
import { formatDate } from "../../utils/format";
import EtapaStatusBadge from "./EtapaStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function EtapaDetailsModal({
  open,
  etapa,
  onClose,
  onEdit,
  onAtualizarProgresso,
  onDelete,
}) {
  if (!etapa) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Etapa</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <Detail label="Nome" value={etapa.nome} />
          <Detail label="Descrição" value={etapa.descricao} />
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Início Previsto" value={formatDate(etapa.dataPrevistaInicio)} />
            <Detail label="Fim Previsto" value={formatDate(etapa.dataPrevistaFim)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Início Real" value={formatDate(etapa.dataRealInicio)} />
            <Detail label="Fim Real" value={formatDate(etapa.dataRealFim)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Progresso" value={`${etapa.percentualProgresso}%`} />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <EtapaStatusBadge status={etapa.status} />
            </div>
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
            onClick={onAtualizarProgresso}
            className="flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Atualizar Progresso
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
    </Dialog>
  );
}
