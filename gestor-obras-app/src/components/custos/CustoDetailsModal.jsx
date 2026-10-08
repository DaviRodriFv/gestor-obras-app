import { useState } from "react";
import { Pencil, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatDate, formatCurrency, CATEGORIA_CUSTO_LABELS } from "../../utils/format";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import CustoStatusBadge from "./CustoStatusBadge";

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function CustoDetailsModal({
  open,
  custo,
  onClose,
  onEdit,
  onRegistrarPagamento,
  onCancelar,
  onDelete,
}) {
  const [actioning, setActioning] = useState(false);

  if (!custo) return null;

  const isPendente = custo.status === "PENDENTE";

  async function handleRegistrarPagamento() {
    setActioning(true);
    try {
      await onRegistrarPagamento();
    } finally {
      setActioning(false);
    }
  }

  async function handleCancelar() {
    setActioning(true);
    try {
      await onCancelar();
    } finally {
      setActioning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Lançamento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <Detail label="Descrição" value={custo.descricao} />
          <div className="grid grid-cols-2 gap-4">
            <Detail
              label="Categoria"
              value={CATEGORIA_CUSTO_LABELS[custo.categoria] ?? custo.categoria}
            />
            <Detail label="Fornecedor" value={custo.fornecedorNome} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Data" value={formatDate(custo.data)} />
            <Detail label="Valor" value={formatCurrency(custo.valor)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <CustoStatusBadge status={custo.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex items-center gap-1.5">
            <Pencil className="w-3.5 h-3.5" />
            Editar
          </Button>

          {isPendente && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegistrarPagamento}
                disabled={actioning}
                className="flex items-center gap-1.5"
              >
                {actioning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Registrar Pagamento
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelar}
                disabled={actioning}
                className="flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Cancelar Lançamento
              </Button>
            </>
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
