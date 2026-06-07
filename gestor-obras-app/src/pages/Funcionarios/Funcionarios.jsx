import { useState } from "react";
import { UserPlus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Select } from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { useFuncionarios } from "../../hooks/useFuncionarios";

const ROLES = [
  { value: "ADMINISTRADOR", label: "Administrador" },
  { value: "EQUIPE", label: "Equipe" },
];

const emptyCreateForm = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  cargo: "EQUIPE",
  telefone: "",
};

function validate(form, isEdit) {
  const errors = {};

  if (form.nome.trim().length < 3) {
    errors.nome = "Nome deve ter no mínimo 3 caracteres.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }

  if (!isEdit) {
    if (form.senha.length < 6) {
      errors.senha = "Senha deve ter no mínimo 6 caracteres.";
    }
    if (form.senha !== form.confirmarSenha) {
      errors.confirmarSenha = "As senhas não coincidem.";
    }
  } else if (form.senha) {
    if (form.senha.length < 6) {
      errors.senha = "Senha deve ter no mínimo 6 caracteres.";
    }
    if (form.senha !== form.confirmarSenha) {
      errors.confirmarSenha = "As senhas não coincidem.";
    }
  }

  return errors;
}

function parseApiError(err) {
  const data = err?.response?.data;
  if (!data) return "Erro ao salvar. Tente novamente.";
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e) => e.defaultMessage ?? String(e)).join(" ");
  }
  if (typeof data.message === "string") return data.message;
  return "Erro ao salvar. Tente novamente.";
}

export default function Funcionarios() {
  const { funcionarios, loading, error, criar, atualizar, deletar } = useFuncionarios();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyCreateForm);
  const [editingId, setEditingId] = useState(null);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  function openCreate() {
    setForm(emptyCreateForm);
    setEditingId(null);
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(func) {
    setForm({
      nome: func.nome,
      email: func.email,
      senha: "",
      confirmarSenha: "",
      cargo: func.cargo,
      telefone: func.telefone ?? "",
      ativo: func.ativo ?? true,
    });
    setEditingId(func.id);
    setFieldErrors({});
    setFormError("");
    setDialogOpen(true);
  }

  function openDelete(id) {
    setToDeleteId(id);
    setDeleteDialogOpen(true);
  }

  async function handleSave() {
    const isEdit = editingId !== null;
    const errs = validate(form, isEdit);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (isEdit) {
        const payload = {
          nome: form.nome,
          email: form.email,
          cargo: form.cargo,
          telefone: form.telefone,
          ativo: form.ativo,
        };
        if (form.senha) payload.senha = form.senha;
        await atualizar(editingId, payload);
      } else {
        await criar({
          nome: form.nome,
          email: form.email,
          senha: form.senha,
          cargo: form.cargo,
          telefone: form.telefone,
        });
      }
      setDialogOpen(false);
    } catch (err) {
      setFormError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deletar(toDeleteId);
    } catch {
      // silently ignore
    } finally {
      setDeleteDialogOpen(false);
    }
  }

  const isEdit = editingId !== null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Funcionários</h1>
          <p className="text-muted-foreground mt-1">Gerencie a equipe e administradores</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Lista de Funcionários</CardTitle>
          </div>
          <CardDescription>{funcionarios.length} funcionário(s) cadastrado(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-destructive text-sm">
              {error}
            </div>
          ) : funcionarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Users className="w-10 h-10 opacity-30" />
              <p className="text-sm">Nenhum funcionário cadastrado.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map((func) => (
                  <TableRow key={func.id}>
                    <TableCell className="font-medium">{func.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{func.email}</TableCell>
                    <TableCell className="text-muted-foreground">{func.telefone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={func.cargo === "ADMINISTRADOR" ? "default" : "secondary"}>
                        {func.cargo === "ADMINISTRADOR" ? "Administrador" : "Equipe"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={func.ativo ? "default" : "outline"}>
                        {func.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(func)}
                          className="h-8 w-8"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(func.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Criar / Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Nome */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setField("nome", e.target.value)}
              />
              {fieldErrors.nome && (
                <p className="text-xs text-destructive">{fieldErrors.nome}</p>
              )}
            </div>

            {/* E-mail */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
              />
              {fieldErrors.email && (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">
                Senha
                {isEdit && (
                  <span className="text-muted-foreground font-normal ml-1">
                    (deixe em branco para manter)
                  </span>
                )}
              </Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={(e) => setField("senha", e.target.value)}
              />
              {fieldErrors.senha && (
                <p className="text-xs text-destructive">{fieldErrors.senha}</p>
              )}
            </div>

            {/* Confirmar Senha — sempre visível */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <Input
                id="confirmarSenha"
                type="password"
                placeholder="••••••••"
                value={form.confirmarSenha}
                onChange={(e) => setField("confirmarSenha", e.target.value)}
              />
              {fieldErrors.confirmarSenha && (
                <p className="text-xs text-destructive">{fieldErrors.confirmarSenha}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={(e) => setField("telefone", e.target.value)}
              />
            </div>

            {/* Cargo */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cargo">Cargo</Label>
              <Select
                id="cargo"
                value={form.cargo}
                onChange={(e) => setField("cargo", e.target.value)}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Status — somente na edição */}
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

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remover Funcionário</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Tem certeza que deseja remover este funcionário? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
