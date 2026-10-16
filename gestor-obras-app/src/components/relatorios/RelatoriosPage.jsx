import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileBarChart, FileText } from "lucide-react";
import { obrasService } from "../../services/obrasService";
import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";

const CONTEUDO_RELATORIO = [
  "Dados da obra: cliente, endereço, status, início e prazo (com alerta de prazo vencido)",
  "Progresso: percentual geral do cronograma e situação de cada etapa",
  "Financeiro: orçamento, total gasto, saldo, situação e gasto por categoria",
  "Lançamentos de custo da obra, com o que já foi pago e o que está pendente",
];

/** Emitir Relatórios: escolha da obra; o documento abre em RelatorioObraPage, pronto para imprimir. */
export default function RelatoriosPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [obras, setObras] = useState([]);
  const [obrasLoading, setObrasLoading] = useState(true);
  const [obraId, setObraId] = useState(searchParams.get("obra") ?? "");

  useEffect(() => {
    obrasService
      .listarObras()
      .then(setObras)
      .finally(() => setObrasLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Relatório de progresso e financeiro da obra, para apresentar a clientes e investidores
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="py-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="obra">Obra</Label>
            <Select id="obra" value={obraId} onChange={(e) => setObraId(e.target.value)} disabled={obrasLoading}>
              <option value="">Selecione uma obra...</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nome}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <FileText className="w-4 h-4" />
              O relatório inclui
            </p>
            <ul className="list-disc pl-6 flex flex-col gap-1 text-sm text-muted-foreground">
              {CONTEUDO_RELATORIO.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <Button
              onClick={() => navigate(`/relatorios/obra/${obraId}`)}
              disabled={!obraId}
              className="flex items-center gap-2"
            >
              <FileBarChart className="w-4 h-4" />
              Emitir relatório
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              O relatório abre em uma página própria, onde você pode imprimir ou salvar em PDF.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
