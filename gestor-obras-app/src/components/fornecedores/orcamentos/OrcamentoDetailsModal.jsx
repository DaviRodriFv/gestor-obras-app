import { useState } from "react";
import { Pencil, Trash2, Download, Loader2 } from "lucide-react";
import { formatDate, formatCurrency } from "../../../utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  );
}

export default function OrcamentoDetailsModal({
  open,
  orcamento,
  onClose,
  onEdit,
  onDelete,
  onBaixarArquivo,
}) {
  const [baixando, setBaixando] = useState(false);

  if (!orcamento) return null;

  async function handleBaixar() {
    setBaixando(true);
    try {
      await onBaixarArquivo();
    } finally {
      setBaixando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Orçamento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Obra" value={orcamento.obraNome} />
            <Detail label="Data do Orçamento" value={formatDate(orcamento.dataOrcamento)} />
          </div>
          <Detail label="Descrição" value={orcamento.descricao} />
          <Detail label="Valor Total" value={formatCurrency(orcamento.valorTotal)} />

          {orcamento.itens?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Itens</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Qtd.</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamento.itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.descricaoMaterial}</TableCell>
                      <TableCell className="text-muted-foreground">{item.quantidade}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(item.precoUnitario)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(item.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {orcamento.possuiArquivo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBaixar}
              disabled={baixando}
              className="flex w-fit items-center gap-1.5"
            >
              {baixando ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Baixar {orcamento.arquivoNome}
            </Button>
          )}
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
    </Dialog>
  );
}
