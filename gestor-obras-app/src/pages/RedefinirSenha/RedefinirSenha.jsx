import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { authService } from "../../services/authService";

function validate(form) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Informe um e-mail válido.";
  }
  if (form.novaSenha.length < 6) {
    errors.novaSenha = "A nova senha deve ter no mínimo 6 caracteres.";
  }
  if (form.novaSenha !== form.confirmarSenha) {
    errors.confirmarSenha = "As senhas não coincidem.";
  }
  return errors;
}

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setApiError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      await authService.redefinirSenha(form.email.trim(), form.novaSenha);
      setSucesso(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (err?.response?.status === 404) {
        setApiError("Nenhuma conta encontrada com este e-mail.");
      } else {
        setApiError(msg ?? "Erro ao redefinir senha. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground leading-none">
                AP Negócios
              </p>
              <p className="text-xs text-muted-foreground">Gestor de Obras</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Redefinir senha</CardTitle>
            <CardDescription>
              Informe seu e-mail cadastrado e escolha uma nova senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sucesso ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="font-medium text-foreground">
                  Senha redefinida com sucesso!
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecionando para o login...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">
                    E-mail <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="novaSenha">
                    Nova senha <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={showNovaSenha ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.novaSenha}
                      onChange={(e) => setField("novaSenha", e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNovaSenha(!showNovaSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNovaSenha ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.novaSenha && (
                    <p className="text-xs text-destructive">
                      {errors.novaSenha}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirmarSenha">
                    Confirmar nova senha{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmar ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmarSenha}
                      onChange={(e) =>
                        setField("confirmarSenha", e.target.value)
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmar ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmarSenha && (
                    <p className="text-xs text-destructive">
                      {errors.confirmarSenha}
                    </p>
                  )}
                </div>

                {apiError && (
                  <p className="text-sm text-destructive">{apiError}</p>
                )}

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? "Redefinindo..." : "Redefinir senha"}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar para o login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
