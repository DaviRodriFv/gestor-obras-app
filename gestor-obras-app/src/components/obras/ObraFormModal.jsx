import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { STATUS_TERMINAL } from "../../utils/format";
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

const EMPTY_FORM = {
  nome: "",
  endereco: "",
  cliente: "",
  dataInicio: "",
  prazoConclusao: "",
  status: "EM_ANDAMENTO",
};

function validate(form) {
  const errors = {};
  const nome = form.nome.trim();
  if (nome.length < 3 || nome.length > 150) {
    errors.nome = "Nome deve ter entre 3 e 150 caracteres.";
  }
  if (!form.endereco.trim()) errors.endereco = "Endereço é obrigatório.";
  if (!form.cliente.trim()) errors.cliente = "Cliente é obrigatório.";
  if (!form.dataInicio) errors.dataInicio = "Data de início é obrigatória.";
  if (!form.prazoConclusao) {
    errors.prazoConclusao = "Prazo de conclusão é obrigatório.";
  } else if (form.dataInicio && form.prazoConclusao < form.dataInicio) {
    errors.prazoConclusao =
      "Prazo deve ser igual ou posterior à data de início.";
  }
  return errors;
}

export default function ObraFormModal({ open, obra, onClose, onSave }) {
  const isEdit = Boolean(obra);
  const isTerminal = isEdit && STATUS_TERMINAL.includes(obra?.status);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setApiError("");
      setErrors({});
      if (obra) {
        setForm({
          nome: obra.nome ?? "",
          endereco: obra.endereco ?? "",
          cliente: obra.cliente ?? "",
          dataInicio: obra.dataInicio ?? "",
          prazoConclusao: obra.prazoConclusao ?? "",
          status: obra.status ?? "EM_ANDAMENTO",
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, obra]);

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
      setApiError(
        err?.response?.data?.message ?? "Erro ao salvar. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  const title = isTerminal
    ? "Visualizar Obra"
    : isEdit
      ? "Editar Obra"
      : "Nova Obra";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isTerminal && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
            Esta obra está em estado{" "}
            <strong>
              {obra.status === "CONCLUIDA" ? "Concluída" : "Cancelada"}
            </strong>{" "}
            e não pode ser editada.
          </p>
        )}

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome da Obra</Label>
            <Input
              id="nome"
              placeholder="Ex.: Residência Família Santos"
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
              disabled={isTerminal}
            />
            {errors.nome && (
              <p className="text-xs text-destructive">{errors.nome}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              placeholder="Rua, número, bairro, cidade"
              value={form.endereco}
              onChange={(e) => setField("endereco", e.target.value)}
              disabled={isTerminal}
            />
            {errors.endereco && (
              <p className="text-xs text-destructive">{errors.endereco}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              placeholder="Nome do cliente"
              value={form.cliente}
              onChange={(e) => setField("cliente", e.target.value)}
              disabled={isTerminal}
            />
            {errors.cliente && (
              <p className="text-xs text-destructive">{errors.cliente}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={form.dataInicio}
                onChange={(e) => setField("dataInicio", e.target.value)}
                disabled={isTerminal}
              />
              {errors.dataInicio && (
                <p className="text-xs text-destructive">{errors.dataInicio}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="prazoConclusao">Prazo de Conclusão</Label>
              <Input
                id="prazoConclusao"
                type="date"
                value={form.prazoConclusao}
                onChange={(e) => setField("prazoConclusao", e.target.value)}
                disabled={isTerminal}
              />
              {errors.prazoConclusao && (
                <p className="text-xs text-destructive">
                  {errors.prazoConclusao}
                </p>
              )}
            </div>
          </div>

          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status">Status Inicial</Label>
              <Select
                id="status"
                value={form.status}
                onChange={(e) => setField("status", e.target.value)}
              >
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="PAUSADA">Pausada</option>
                <option value="CONCLUIDA">Concluída</option>
              </Select>
            </div>
          )}

          {apiError && <p className="text-sm text-destructive">{apiError}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {isTerminal ? "Fechar" : "Cancelar"}
          </Button>
          {!isTerminal && (
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Salvar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
