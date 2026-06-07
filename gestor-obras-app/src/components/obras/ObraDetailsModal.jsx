import { Pencil, RefreshCw, Trash2 } from "lucide-react";
import { formatDate, STATUS_TERMINAL } from "../../utils/format";
import StatusBadge from "./StatusBadge";
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

export default function ObraDetailsModal({
  open,
  obra,
  onClose,
  onEdit,
  onAlterarStatus,
  onDelete,
}) {
  if (!obra) return null;
  const isTerminal = STATUS_TERMINAL.includes(obra.status);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Obra</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <Detail label="Nome" value={obra.nome} />
          <Detail label="Endereço" value={obra.endereco} />
          <Detail label="Cliente" value={obra.cliente} />
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Data de Início" value={formatDate(obra.dataInicio)} />
            <Detail label="Prazo de Conclusão" value={formatDate(obra.prazoConclusao)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <StatusBadge status={obra.status} />
          </div>
          {obra.criadoEm && (
            <Detail
              label="Cadastrada em"
              value={new Date(obra.criadoEm).toLocaleDateString("pt-BR")}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex items-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" />
            {isTerminal ? "Ver Formulário" : "Editar"}
          </Button>

          {!isTerminal && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAlterarStatus}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Alterar Status
            </Button>
          )}

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
