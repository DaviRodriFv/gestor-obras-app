import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2, Paperclip } from "lucide-react";
import { obrasService } from "../../../services/obrasService";
import { formatCurrency } from "../../../utils/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Select } from "../../ui/select";

const EMPTY_ITEM = { descricaoMaterial: "", quantidade: "", precoUnitario: "" };

const EMPTY_FORM = {
  obraId: "",
  descricao: "",
  dataOrcamento: "",
  valorTotal: "",
  itens: [],
};

function validate(form, temArquivoExistente) {
  const errors = {};
  if (!form.obraId) errors.obraId = "Selecione a obra.";
  if (!form.dataOrcamento) errors.dataOrcamento = "Data do orçamento é obrigatória.";

  const itensValidos = form.itens.filter(
    (i) => i.descricaoMaterial.trim() || i.quantidade || i.precoUnitario
  );
  const itensErrors = itensValidos.map((item) => {
    const e = {};
    if (!item.descricaoMaterial.trim()) e.descricaoMaterial = "Obrigatório.";
    if (!item.quantidade || Number(item.quantidade) <= 0) e.quantidade = "Deve ser > 0.";
    if (!item.precoUnitario || Number(item.precoUnitario) <= 0) e.precoUnitario = "Deve ser > 0.";
    return e;
  });
  if (itensErrors.some((e) => Object.keys(e).length > 0)) {
    errors.itens = itensErrors;
  }

  const temItens = itensValidos.length > 0;
  if (!temItens && !form.novoArquivo && !temArquivoExistente) {
    errors.geral = "Informe ao menos os itens do orçamento ou anexe um arquivo PDF.";
  }
  if (!temItens && !form.valorTotal) {
    errors.valorTotal = "Informe o valor total quando não houver itens detalhados.";
  }

  return errors;
}

export default function OrcamentoFormModal({ open, orcamento, onClose, onSave }) {
  const isEdit = Boolean(orcamento);

  const [obras, setObras] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (open) {
      obrasService.listarObras().then(setObras);
      setApiError("");
      setErrors({});
      if (orcamento) {
        setForm({
          obraId: orcamento.obraId ?? "",
          descricao: orcamento.descricao ?? "",
          dataOrcamento: orcamento.dataOrcamento ?? "",
          valorTotal: orcamento.itens?.length > 0 ? "" : (orcamento.valorTotal ?? ""),
          itens: (orcamento.itens ?? []).map((i) => ({
            descricaoMaterial: i.descricaoMaterial,
            quantidade: String(i.quantidade),
            precoUnitario: String(i.precoUnitario),
          })),
          novoArquivo: null,
        });
      } else {
        setForm(EMPTY_FORM);
      }
    }
  }, [open, orcamento]);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined, geral: undefined }));
  }

  function setItemField(index, field, value) {
    setForm((f) => ({
      ...f,
      itens: f.itens.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
    setErrors((e) => ({ ...e, itens: undefined, geral: undefined, valorTotal: undefined }));
  }

  function addItem() {
    setForm((f) => ({ ...f, itens: [...f.itens, { ...EMPTY_ITEM }] }));
  }

  function removeItem(index) {
    setForm((f) => ({ ...f, itens: f.itens.filter((_, i) => i !== index) }));
  }

  const temArquivoExistente = Boolean(orcamento?.possuiArquivo);
  const itensValidos = form.itens.filter(
    (i) => i.descricaoMaterial.trim() || i.quantidade || i.precoUnitario
  );
  const temItens = itensValidos.length > 0;
  const totalCalculado = itensValidos.reduce(
    (sum, i) => sum + (Number(i.quantidade) || 0) * (Number(i.precoUnitario) || 0),
    0
  );

  async function handleSave() {
    const errs = validate(form, temArquivoExistente);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    setApiError("");
    try {
      const dto = {
        obraId: form.obraId,
        descricao: form.descricao || null,
        dataOrcamento: form.dataOrcamento,
        itens: temItens
          ? itensValidos.map((i) => ({
              descricaoMaterial: i.descricaoMaterial,
              quantidade: Number(i.quantidade),
              precoUnitario: Number(i.precoUnitario),
            }))
          : [],
        valorTotal: temItens ? null : Number(form.valorTotal),
      };
      await onSave(dto, form.novoArquivo);
      onClose();
    } catch (err) {
      setApiError(err?.response?.data?.message ?? "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto py-2 pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="obraId">Obra <span className="text-destructive">*</span></Label>
              <Select
                id="obraId"
                value={form.obraId}
                onChange={(e) => setField("obraId", e.target.value)}
              >
                <option value="">Selecione uma obra...</option>
                {obras.map((obra) => (
                  <option key={obra.id} value={obra.id}>
                    {obra.nome}
                  </option>
                ))}
              </Select>
              {errors.obraId && <p className="text-xs text-destructive">{errors.obraId}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dataOrcamento">Data do Orçamento <span className="text-destructive">*</span></Label>
              <Input
                id="dataOrcamento"
                type="date"
                value={form.dataOrcamento}
                onChange={(e) => setField("dataOrcamento", e.target.value)}
              />
              {errors.dataOrcamento && (
                <p className="text-xs text-destructive">{errors.dataOrcamento}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              placeholder="Observações sobre o orçamento (opcional)"
              value={form.descricao}
              onChange={(e) => setField("descricao", e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Itens do Orçamento</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Adicionar Item
              </Button>
            </div>

            {form.itens.length > 0 && (
              <div className="flex flex-col gap-2">
                {form.itens.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder="Material / serviço"
                        value={item.descricaoMaterial}
                        onChange={(e) => setItemField(index, "descricaoMaterial", e.target.value)}
                      />
                      {errors.itens?.[index]?.descricaoMaterial && (
                        <p className="text-xs text-destructive">{errors.itens[index].descricaoMaterial}</p>
                      )}
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        step="0.001"
                        placeholder="Qtd."
                        value={item.quantidade}
                        onChange={(e) => setItemField(index, "quantidade", e.target.value)}
                      />
                      {errors.itens?.[index]?.quantidade && (
                        <p className="text-xs text-destructive">{errors.itens[index].quantidade}</p>
                      )}
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Preço unit."
                        value={item.precoUnitario}
                        onChange={(e) => setItemField(index, "precoUnitario", e.target.value)}
                      />
                      {errors.itens?.[index]?.precoUnitario && (
                        <p className="text-xs text-destructive">{errors.itens[index].precoUnitario}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      className="h-10 w-10 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-right text-sm text-muted-foreground">
                  Total calculado: <strong className="text-foreground">{formatCurrency(totalCalculado)}</strong>
                </p>
              </div>
            )}

            {!temItens && (
              <div className="mt-2 flex flex-col gap-1.5">
                <Label htmlFor="valorTotal">Valor Total <span className="text-destructive">*</span></Label>
                <Input
                  id="valorTotal"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={form.valorTotal}
                  onChange={(e) => setField("valorTotal", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Obrigatório quando não há itens detalhados — informe manualmente ou adicione itens acima.
                </p>
                {errors.valorTotal && <p className="text-xs text-destructive">{errors.valorTotal}</p>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="arquivo">Anexo (PDF)</Label>
            {temArquivoExistente && !form.novoArquivo && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Paperclip className="w-3.5 h-3.5" />
                Arquivo atual: {orcamento.arquivoNome}. Selecione um novo abaixo para substituir.
              </p>
            )}
            <Input
              id="arquivo"
              type="file"
              accept="application/pdf"
              onChange={(e) => setField("novoArquivo", e.target.files?.[0] ?? null)}
            />
          </div>

          {errors.geral && <p className="text-sm text-destructive">{errors.geral}</p>}
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
