import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function OrcamentoFormModal({ open, orcamentoAtual, onClose, onSave }) {
  const [valor, setValor] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setValor(orcamentoAtual != null ? String(orcamentoAtual) : "");
      setError("");
      setApiError("");
    }
  }, [open, orcamentoAtual]);

  async function handleSave() {
    const numero = Number(valor);
    if (!valor || Number.isNaN(numero) || numero <= 0) {
      setError("Orçamento deve ser maior que zero.");
      return;
    }
    setSaving(true);
    setApiError("");
    try {
      await onSave(numero);
      onClose();
    } catch (err) {
      setApiError(err?.response?.data?.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Definir Orçamento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="valor">Orçamento Total <span className="text-destructive">*</span></Label>
            <Input
              id="valor"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => {
                setValor(e.target.value);
                setError("");
              }}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {apiError && <p className="text-sm text-destructive">{apiError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
