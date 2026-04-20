import { useState } from "react";
import { UserPlus, Pencil, Trash2, Users } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "equipe", label: "Equipe" },
];

const initialFuncionarios = [
  { id: 1, nome: "Carlos Silva", email: "carlos@exemplo.com", cargo: "admin" },
  { id: 2, nome: "Ana Pereira", email: "ana@exemplo.com", cargo: "equipe" },
];

const emptyForm = { nome: "", email: "", cargo: "equipe" };

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState(initialFuncionarios);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [toDeleteId, setToDeleteId] = useState(null);
  const [formError, setFormError] = useState("");

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setFormError("");
    setDialogOpen(true);
  }

  function openEdit(func) {
    setForm({ nome: func.nome, email: func.email, cargo: func.cargo });
    setEditingId(func.id);
    setFormError("");
    setDialogOpen(true);
  }

  function openDelete(id) {
    setToDeleteId(id);
    setDeleteDialogOpen(true);
  }

  function handleSave() {
    if (!form.nome.trim() || !form.email.trim()) {
      setFormError("Nome e e-mail são obrigatórios.");
      return;
    }
    if (editingId !== null) {
      setFuncionarios((prev) =>
        prev.map((f) => (f.id === editingId ? { ...f, ...form } : f))
      );
    } else {
      const newId = Date.now();
      setFuncionarios((prev) => [...prev, { id: newId, ...form }]);
    }
    setDialogOpen(false);
  }

  function handleDelete() {
    setFuncionarios((prev) => prev.filter((f) => f.id !== toDeleteId));
    setDeleteDialogOpen(false);
  }

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
          {funcionarios.length === 0 ? (
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
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcionarios.map((func) => (
                  <TableRow key={func.id}>
                    <TableCell className="font-medium">{func.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{func.email}</TableCell>
                    <TableCell>
                      <Badge variant={func.cargo === "admin" ? "default" : "secondary"}>
                        {func.cargo === "admin" ? "Administrador" : "Equipe"}
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
            <DialogTitle>{editingId !== null ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cargo">Cargo</Label>
              <Select
                id="cargo"
                value={form.cargo}
                onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </Select>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId !== null ? "Salvar" : "Criar"}
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
