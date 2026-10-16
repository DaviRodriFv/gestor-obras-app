import { useState, useEffect } from "react";
import { Loader2, Paperclip, X } from "lucide-react";
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
import { custosService } from "../../services/custosService";
import { fornecedoresService } from "../../services/fornecedoresService";
import { CATEGORIA_CUSTO_LABELS, STATUS_CUSTO_LABELS } from "../../utils/format";
import CustoStatusBadge from "./CustoStatusBadge";

const EMPTY_FORM = {
  descricao: "",
  valor: "",
  data: "",
  categoria: "MATERIAL",
  fornecedorId: "",
  status: "PENDENTE",
};

// Mesmo limite do backend (spring.servlet.multipart.max-file-size)
const TAMANHO_MAXIMO_ANEXO = 10 * 1024 * 1024;
const TIPOS_ANEXO = ["application/pdf", "image/png", "image/jpeg"];

function validarAnexo(arquivo) {
  if (!arquivo) return undefined;
  if (!TIPOS_ANEXO.includes(arquivo.type)) return "O anexo deve ser um PDF ou uma imagem (PNG ou JPG).";
  if (arquivo.size > TAMANHO_MAXIMO_ANEXO) return "O anexo deve ter no máximo 10 MB.";
  return undefined;
}

function validate(form) {
  const errors = {};
  if (!form.descricao.trim()) errors.descricao = "Descrição é obrigatória.";
  const valor = Number(form.valor);
  if (!form.valor || Number.isNaN(valor) || valor <= 0) {
    errors.valor = "Valor deve ser maior que zero.";
  }
  if (!form.data) errors.data = "Data é obrigatória.";
  return errors;
}

/**
 * Modal de lançamento de custo (criação/edição) da tela Custos.
 * Recebe `obraId` e chama `onSalvo` após criar/atualizar com sucesso.
 * O anexo (orçamento, nota fiscal, recibo) é enviado depois do lançamento, em PUT /anexo.
 */
export default function LancamentoFormModal({ open, custo, obraId, onClose, onSalvo }) {
  const isEdit = Boolean(custo);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [fornecedores, setFornecedores] = useState([]);
  const [novoArquivo, setNovoArquivo] = useState(null);
  const [removerAnexo, setRemoverAnexo] = useState(false);
  // Lançamento já criado nesta abertura do modal — se só o anexo falhar, salvar de novo não duplica o custo
  const [custoCriadoId, setCustoCriadoId] = useState(null);

  useEffect(() => {
    if (open) {
      setApiError("");
      setErrors({});
      setNovoArquivo(null);
      setRemoverAnexo(false);
      setCustoCriadoId(null);
      if (custo) {
        setForm({
          descricao: custo.descricao ?? "",
          valor: custo.valor ?? "",
          data: custo.data ?? "",
          categoria: custo.categoria ?? "MATERIAL",
          fornecedorId: custo.fornecedorId ?? "",
          status: custo.status ?? "PENDENTE",
        });
      } else {
        setForm(EMPTY_FORM);
      }
      fornecedoresService
        .listarTodos()
        .then((data) => setFornecedores(data.filter((f) => f.ativo)))
        .catch(() => setFornecedores([]));
    }
  }, [open, custo]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function handleArquivoChange(arquivo) {
    setNovoArquivo(arquivo);
    setRemoverAnexo(false);
    setErrors((e) => ({ ...e, arquivo: validarAnexo(arquivo) }));
  }

  async function handleSave() {
    const errs = validate(form);
    const erroAnexo = validarAnexo(novoArquivo);
    if (erroAnexo) errs.arquivo = erroAnexo;
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setApiError("");
    const dto = {
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      data: form.data,
      categoria: form.categoria,
      fornecedorId: form.fornecedorId || null,
    };
    const idExistente = custo?.id ?? custoCriadoId;
    // O status só muda via PATCH /status (Registrar pagamento / Cancelar) — o PUT de edição o ignora.
    if (!idExistente) dto.status = form.status;

    let salvo;
    try {
      salvo = idExistente
        ? await custosService.atualizar(obraId, idExistente, dto)
        : await custosService.criar(obraId, dto);
    } catch (err) {
      setApiError(err?.response?.data?.message ?? "Erro ao salvar. Tente novamente.");
      setSaving(false);
      return;
    }
    setCustoCriadoId(salvo.id);

    try {
      if (novoArquivo) {
        await custosService.anexarArquivo(obraId, salvo.id, novoArquivo);
      } else if (removerAnexo) {
        await custosService.removerArquivo(obraId, salvo.id);
      }
    } catch (err) {
      await onSalvo();
      setApiError(
        `Lançamento salvo, mas o anexo não foi enviado: ${
          err?.response?.data?.message ?? "tente novamente."
        }`,
      );
      setSaving(false);
      return;
    }

    await onSalvo();
    setSaving(false);
    onClose();
  }

  const anexoAtual = custo?.possuiAnexo && !removerAnexo ? custo.anexoNome : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Lançamento" : "Novo Lançamento"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao">Descrição <span className="text-destructive">*</span></Label>
            <Input
              id="descricao"
              placeholder="Ex.: Compra de cimento"
              value={form.descricao}
              onChange={(e) => setField("descricao", e.target.value)}
            />
            {errors.descricao && <p className="text-xs text-destructive">{errors.descricao}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor">Valor <span className="text-destructive">*</span></Label>
              <Input
                id="valor"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => setField("valor", e.target.value)}
              />
              {errors.valor && <p className="text-xs text-destructive">{errors.valor}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="data">Data <span className="text-destructive">*</span></Label>
              <Input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) => setField("data", e.target.value)}
              />
              {errors.data && <p className="text-xs text-destructive">{errors.data}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="categoria">Categoria <span className="text-destructive">*</span></Label>
              <Select
                id="categoria"
                value={form.categoria}
                onChange={(e) => setField("categoria", e.target.value)}
              >
                {Object.entries(CATEGORIA_CUSTO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status {isEdit ? "" : "Inicial"}</Label>
              {isEdit ? (
                <div className="flex h-10 items-center">
                  <CustoStatusBadge status={form.status} />
                </div>
              ) : (
                <Select id="status" value={form.status} onChange={(e) => setField("status", e.target.value)}>
                  <option value="PENDENTE">{STATUS_CUSTO_LABELS.PENDENTE}</option>
                  <option value="PAGO">{STATUS_CUSTO_LABELS.PAGO}</option>
                </Select>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="fornecedorId">Fornecedor</Label>
            <Select
              id="fornecedorId"
              value={form.fornecedorId}
              onChange={(e) => setField("fornecedorId", e.target.value)}
            >
              <option value="">Nenhum</option>
              {fornecedores.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="arquivo">Anexo (orçamento, nota fiscal ou recibo)</Label>
            {anexoAtual && !novoArquivo && (
              <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                  {anexoAtual}
                </span>
                <button
                  type="button"
                  onClick={() => setRemoverAnexo(true)}
                  className="flex items-center gap-1 text-xs text-destructive hover:underline shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                  Remover
                </button>
              </div>
            )}
            {removerAnexo && (
              <p className="text-xs text-muted-foreground">
                O anexo atual será removido ao salvar.{" "}
                <button type="button" onClick={() => setRemoverAnexo(false)} className="underline">
                  Desfazer
                </button>
              </p>
            )}
            <Input
              id="arquivo"
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => handleArquivoChange(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              PDF, PNG ou JPG, até 10 MB.{anexoAtual && !novoArquivo ? " Selecionar outro arquivo substitui o atual." : ""}
            </p>
            {errors.arquivo && <p className="text-xs text-destructive">{errors.arquivo}</p>}
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
