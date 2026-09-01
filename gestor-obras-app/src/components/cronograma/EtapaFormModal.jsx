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

const EMPTY_FORM = {
  nome: "",
  descricao: "",
  dataPrevistaInicio: "",
  dataPrevistaFim: "",
};

function validate(form) {
  const errors = {};
  const nome = form.nome.trim();
  if (nome.length < 3 || nome.length > 150) {
    errors.nome = "Nome deve ter entre 3 e 150 caracteres.";
  }
  if (!form.dataPrevistaInicio) errors.dataPrevistaInicio = "Data prevista de início é obrigatória.";
  if (!form.dataPrevistaFim) {
    errors.dataPrevistaFim = "Data prevista de término é obrigatória.";
  } else if (form.dataPrevistaInicio && form.dataPrevistaFim < form.dataPrevistaInicio) {
    errors.dataPrevistaFim = "Data de término deve ser igual ou posterior à de início.";
  }
  return errors;
}

export default function EtapaFormModal({ open, etapa, onClose, onSave }) {
  const isEdit = Boolean(etapa);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setApiError("");
      setErrors({});
      if (etapa) {
        setForm({
          nome: etapa.nome ?? "",
          descricao: etapa.descricao ?? "",
          dataPrevistaInicio: etapa.dataPrevistaInicio ?? "",
          dataPrevistaFim: etapa.dataPrevistaFim ?? "",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, etapa]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSave() {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setApiError("");
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      setApiError(err?.response?.data?.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Etapa" : "Nova Etapa"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome <span className="text-destructive">*</span></Label>
            <Input
              id="nome"
              placeholder="Ex.: Fundação"
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
            />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              placeholder="Detalhes da etapa (opcional)"
              value={form.descricao}
              onChange={(e) => setField("descricao", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataPrevistaInicio">Início Previsto <span className="text-destructive">*</span></Label>
              <Input
                id="dataPrevistaInicio"
                type="date"
                value={form.dataPrevistaInicio}
                onChange={(e) => setField("dataPrevistaInicio", e.target.value)}
              />
              {errors.dataPrevistaInicio && (
                <p className="text-xs text-destructive">{errors.dataPrevistaInicio}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataPrevistaFim">Fim Previsto <span className="text-destructive">*</span></Label>
              <Input
                id="dataPrevistaFim"
                type="date"
                value={form.dataPrevistaFim}
                onChange={(e) => setField("dataPrevistaFim", e.target.value)}
              />
              {errors.dataPrevistaFim && (
                <p className="text-xs text-destructive">{errors.dataPrevistaFim}</p>
              )}
            </div>
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
