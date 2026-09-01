import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { STATUS_ETAPA_LABELS } from "../../utils/format";
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
import { Select } from "../ui/select";

export default function AtualizarProgressoModal({ open, etapa, onClose, onConfirm }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open && etapa) {
      setForm({
        dataRealInicio: etapa.dataRealInicio ?? "",
        dataRealFim: etapa.dataRealFim ?? "",
        percentualProgresso: etapa.percentualProgresso ?? 0,
        status: etapa.status ?? "NAO_INICIADA",
      });
      setApiError("");
    }
  }, [open, etapa]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleConfirm() {
    setSaving(true);
    setApiError("");
    try {
      await onConfirm({
        dataRealInicio: form.dataRealInicio || null,
        dataRealFim: form.dataRealFim || null,
        percentualProgresso: Number(form.percentualProgresso),
        status: form.status,
      });
      onClose();
    } catch (err) {
      setApiError(err?.response?.data?.message ?? "Erro ao atualizar progresso. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (!etapa) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Progresso — {etapa.nome}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataRealInicio">Início Real</Label>
              <Input
                id="dataRealInicio"
                type="date"
                value={form.dataRealInicio ?? ""}
                onChange={(e) => setField("dataRealInicio", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataRealFim">Fim Real</Label>
              <Input
                id="dataRealFim"
                type="date"
                value={form.dataRealFim ?? ""}
                onChange={(e) => setField("dataRealFim", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="percentualProgresso">Progresso (%)</Label>
            <Input
              id="percentualProgresso"
              type="number"
              min="0"
              max="100"
              value={form.percentualProgresso ?? 0}
              onChange={(e) => setField("percentualProgresso", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.status ?? "NAO_INICIADA"}
              onChange={(e) => setField("status", e.target.value)}
            >
              {Object.entries(STATUS_ETAPA_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {apiError && <p className="text-sm text-destructive">{apiError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
