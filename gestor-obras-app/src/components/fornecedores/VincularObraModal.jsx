import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { obrasService } from "../../services/obrasService";
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

export default function VincularObraModal({ open, fornecedor, onClose, onConfirm }) {
  const [obras, setObras] = useState([]);
  const [obraId, setObraId] = useState("");
  const [loadingObras, setLoadingObras] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setApiError("");
      setObraId("");
      setLoadingObras(true);
      obrasService
        .listarObras()
        .then(setObras)
        .finally(() => setLoadingObras(false));
    }
  }, [open]);

  const vinculadasIds = new Set((fornecedor?.obrasVinculadas ?? []).map((o) => o.id));
  const disponiveis = obras.filter((o) => !vinculadasIds.has(o.id));

  async function handleConfirm() {
    if (!obraId) return;
    setSaving(true);
    setApiError("");
    try {
      await onConfirm(obraId);
      onClose();
    } catch (err) {
      setApiError(err?.response?.data?.message ?? "Erro ao vincular obra. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Vincular a uma Obra</DialogTitle>
        </DialogHeader>

        {loadingObras ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Carregando obras...</span>
          </div>
        ) : disponiveis.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            Não há obras disponíveis para vincular.
          </p>
        ) : (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="obra">Obra</Label>
              <Select id="obra" value={obraId} onChange={(e) => setObraId(e.target.value)}>
                <option value="">Selecione uma obra...</option>
                {disponiveis.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nome}
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
          {disponiveis.length > 0 && (
            <Button onClick={handleConfirm} disabled={saving || !obraId}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Vincular
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
