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
import { Select } from "../ui/select";

const EMPTY_FORM = {
  nome: "",
  tipoServico: "",
  telefone: "",
  email: "",
  endereco: "",
};

function validate(form) {
  const errors = {};
  const nome = form.nome.trim();
  if (nome.length < 3 || nome.length > 150) {
    errors.nome = "Nome deve ter entre 3 e 150 caracteres.";
  }
  if (!form.tipoServico.trim()) errors.tipoServico = "Tipo de serviço é obrigatório.";
  if (!form.telefone.trim()) errors.telefone = "Telefone é obrigatório.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }
  if (!form.endereco.trim()) errors.endereco = "Endereço é obrigatório.";
  return errors;
}

export default function FornecedorFormModal({ open, fornecedor, onClose, onSave }) {
  const isEdit = Boolean(fornecedor);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      setApiError("");
      setErrors({});
      if (fornecedor) {
        setForm({
          nome: fornecedor.nome ?? "",
          tipoServico: fornecedor.tipoServico ?? "",
          telefone: fornecedor.telefone ?? "",
          email: fornecedor.email ?? "",
          endereco: fornecedor.endereco ?? "",
          ativo: fornecedor.ativo ?? true,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, fornecedor]);

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
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 409) {
        setApiError(msg ?? "E-mail já cadastrado.");
      } else {
        setApiError(msg ?? "Erro ao salvar. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome / Razão Social <span className="text-destructive">*</span></Label>
            <Input
              id="nome"
              placeholder="Ex.: Materiais São José Ltda."
              value={form.nome}
              onChange={(e) => setField("nome", e.target.value)}
            />
            {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipoServico">Tipo de Serviço <span className="text-destructive">*</span></Label>
            <Input
              id="tipoServico"
              placeholder="Ex.: Elétrica, Materiais, Pintura..."
              value={form.tipoServico}
              onChange={(e) => setField("tipoServico", e.target.value)}
            />
            {errors.tipoServico && <p className="text-xs text-destructive">{errors.tipoServico}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefone">Telefone <span className="text-destructive">*</span></Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => setField("telefone", e.target.value)}
              />
              {errors.telefone && <p className="text-xs text-destructive">{errors.telefone}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail <span className="text-destructive">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="endereco">Endereço <span className="text-destructive">*</span></Label>
            <Input
              id="endereco"
              placeholder="Rua, número, bairro, cidade"
              value={form.endereco}
              onChange={(e) => setField("endereco", e.target.value)}
            />
            {errors.endereco && <p className="text-xs text-destructive">{errors.endereco}</p>}
          </div>

          {isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ativo">Status</Label>
              <Select
                id="ativo"
                value={form.ativo ? "true" : "false"}
                onChange={(e) => setField("ativo", e.target.value === "true")}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </Select>
            </div>
          )}

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
