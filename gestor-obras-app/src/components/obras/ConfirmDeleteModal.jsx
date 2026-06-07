import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";

export default function ConfirmDeleteModal({ open, obra, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setDeleting(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch {
      setError("Erro ao excluir. Tente novamente.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir Obra</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground py-2">
          Tem certeza que deseja excluir a obra{" "}
          <strong className="text-foreground">"{obra?.nome}"</strong>? Esta ação não pode ser
          desfeita.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleting}>
            {deleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
