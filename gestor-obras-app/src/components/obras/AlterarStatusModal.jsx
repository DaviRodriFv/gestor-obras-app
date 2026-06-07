import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { STATUS_LABELS, STATUS_TRANSITIONS } from "../../utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select } from "../ui/select";

export default function AlterarStatusModal({ open, obra, onClose, onConfirm }) {
  const transitions = obra ? (STATUS_TRANSITIONS[obra.status] ?? []) : [];
  const [novoStatus, setNovoStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setNovoStatus(transitions[0] ?? "");
      setApiError("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, obra]);

  async function handleConfirm() {
    if (!novoStatus) return;
    setSaving(true);
    setApiError("");
    try {
      await onConfirm(novoStatus);
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setApiError(msg ?? "Transição de status inválida.");
      } else {
        setApiError("Erro ao alterar status. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!obra) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Alterar Status</DialogTitle>
        </DialogHeader>

        {transitions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Este status não permite transições. A obra está em estado terminal.
          </p>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-muted-foreground">
              Status atual:{" "}
              <strong className="text-foreground">{STATUS_LABELS[obra.status]}</strong>
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="novoStatus">Novo Status</Label>
              <Select
                id="novoStatus"
                value={novoStatus}
                onChange={(e) => setNovoStatus(e.target.value)}
              >
                {transitions.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            {apiError && <p className="text-sm text-destructive">{apiError}</p>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          {transitions.length > 0 && (
            <Button onClick={handleConfirm} disabled={saving || !novoStatus}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Confirmar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
