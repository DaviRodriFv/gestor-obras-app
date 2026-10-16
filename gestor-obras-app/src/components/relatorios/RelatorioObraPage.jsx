import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Printer, Loader2, RefreshCw } from "lucide-react";
import { relatoriosService } from "../../services/relatoriosService";
import { Button } from "../ui/button";
import {
  formatDate,
  formatCurrency,
  STATUS_LABELS,
  STATUS_TERMINAL,
  STATUS_ETAPA_LABELS,
  CATEGORIA_CUSTO_LABELS,
  STATUS_CUSTO_LABELS,
  SITUACAO_FINANCEIRA_LABELS,
} from "../../utils/format";

const DIA_EM_MS = 24 * 60 * 60 * 1000;

function hojeISO() {
  const hoje = new Date();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${hoje.getFullYear()}-${mes}-${dia}`;
}

function formatDateTime(isoDateTime) {
  if (!isoDateTime) return "—";
  return new Date(isoDateTime).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function formatPercent(value) {
  return value == null ? "—" : `${Math.round(value)}%`;
}

/** Texto do alerta de prazo: vencido, faltando poucos dias, ou nada para obra encerrada. */
function situacaoPrazo(obra) {
  if (!obra.prazoConclusao || STATUS_TERMINAL.includes(obra.status)) return null;
  const dias = Math.round((new Date(obra.prazoConclusao) - new Date(hojeISO())) / DIA_EM_MS);
  if (dias < 0) return { texto: `Prazo vencido há ${-dias} dia(s)`, alerta: true };
  if (dias <= 30) return { texto: `Faltam ${dias} dia(s) para o prazo`, alerta: true };
  return { texto: `Faltam ${dias} dia(s) para o prazo`, alerta: false };
}

function Secao({ titulo, children }) {
  return (
    <section className="mb-8 break-inside-avoid-page">
      <h2 className="text-base font-semibold text-zinc-900 border-b border-zinc-300 pb-1.5 mb-4">{titulo}</h2>
      {children}
    </section>
  );
}

function Campo({ label, valor, destaque }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`text-sm font-medium ${destaque ? "text-red-600" : "text-zinc-900"}`}>{valor || "—"}</p>
    </div>
  );
}

function Indicador({ label, valor, detalhe, destaque }) {
  return (
    <div className="rounded-md border border-zinc-300 px-4 py-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`text-xl font-semibold ${destaque ? "text-red-600" : "text-zinc-900"}`}>{valor}</p>
      {detalhe && <p className="text-xs text-zinc-500 mt-0.5">{detalhe}</p>}
    </div>
  );
}

function BarraProgresso({ percentual, cor = "bg-zinc-800" }) {
  return (
    <div className="w-full h-2 rounded-full bg-zinc-200 overflow-hidden print:border print:border-zinc-300">
      <div className={`h-full ${cor}`} style={{ width: `${Math.min(percentual ?? 0, 100)}%` }} />
    </div>
  );
}

const Th = ({ children, className = "" }) => (
  <th className={`text-left text-[11px] uppercase tracking-wide text-zinc-500 font-medium py-1.5 pr-3 ${className}`}>
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={`text-sm text-zinc-800 py-1.5 pr-3 border-t border-zinc-200 ${className}`}>{children}</td>
);

/**
 * Relatório de progresso e financeiro da obra (caso de uso Emitir Relatórios).
 * Página fora do Layout, com fundo branco, para imprimir ou salvar em PDF pelo navegador.
 */
export default function RelatorioObraPage() {
  const { obraId } = useParams();
  const navigate = useNavigate();
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    setLoading(true);
    setErro("");
    try {
      setRelatorio(await relatoriosService.relatorioObra(obraId));
    } catch (err) {
      setErro(
        err?.response?.status === 404
          ? "Obra não encontrada."
          : "Não foi possível gerar o relatório. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraId]);

  useEffect(() => {
    if (relatorio) document.title = `Relatório - ${relatorio.obra.nome}`;
    return () => {
      document.title = "Gestor de Obras";
    };
  }, [relatorio]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Gerando relatório...</span>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-destructive">{erro}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/relatorios")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <Button variant="outline" size="sm" onClick={carregar} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const { obra, cronograma, financeiro, custos, resumo } = relatorio;
  const prazo = situacaoPrazo(obra);
  const saldoNegativo = financeiro.saldoRestante != null && financeiro.saldoRestante < 0;
  const situacaoRuim = ["EM_ALERTA", "ORCAMENTO_EXCEDIDO"].includes(financeiro.situacao);

  return (
    <div className="min-h-screen bg-zinc-100 print:bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-zinc-300 bg-white px-6 py-3 print:hidden">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <p className="text-sm text-zinc-500 hidden sm:block">
          Use "Salvar como PDF" na janela de impressão para gerar o arquivo.
        </p>
        <Button size="sm" onClick={() => window.print()} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <article className="mx-auto my-8 max-w-4xl bg-white px-10 py-10 shadow-sm text-zinc-900 print:my-0 print:max-w-none print:px-0 print:py-0 print:shadow-none">
        <header className="mb-8 flex items-start justify-between gap-6 border-b-2 border-zinc-900 pb-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">
              André Paulino Negócios Imobiliários · Gestor de Obras
            </p>
            <h1 className="text-2xl font-bold mt-1">Relatório da Obra</h1>
            <p className="text-lg text-zinc-700">{obra.nome}</p>
          </div>
          <div className="text-right text-xs text-zinc-500 shrink-0">
            <p>Gerado em {formatDateTime(relatorio.geradoEm)}</p>
            {relatorio.geradoPor && <p>por {relatorio.geradoPor}</p>}
          </div>
        </header>

        <Secao titulo="1. Dados da obra">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            <Campo label="Cliente" valor={obra.cliente} />
            <Campo label="Endereço" valor={obra.endereco} />
            <Campo label="Status" valor={STATUS_LABELS[obra.status] ?? obra.status} />
            <Campo label="Início" valor={formatDate(obra.dataInicio)} />
            <Campo label="Prazo de conclusão" valor={formatDate(obra.prazoConclusao)} />
            {prazo && <Campo label="Prazo" valor={prazo.texto} destaque={prazo.alerta} />}
          </div>
        </Secao>

        <Secao titulo="2. Resumo">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Indicador
              label="Progresso"
              valor={formatPercent(cronograma.progressoGeral)}
              detalhe={`${resumo.etapasConcluidas} de ${resumo.totalEtapas} etapa(s) concluída(s)`}
            />
            <Indicador
              label="Etapas atrasadas"
              valor={resumo.etapasAtrasadas}
              destaque={resumo.etapasAtrasadas > 0}
            />
            <Indicador
              label="Orçamento consumido"
              valor={formatPercent(financeiro.percentualConsumido)}
              detalhe={`${formatCurrency(financeiro.totalGasto)} de ${
                financeiro.orcamento != null ? formatCurrency(financeiro.orcamento) : "orçamento não definido"
              }`}
              destaque={situacaoRuim}
            />
            <Indicador
              label="Situação financeira"
              valor={SITUACAO_FINANCEIRA_LABELS[financeiro.situacao] ?? financeiro.situacao}
              destaque={situacaoRuim}
            />
          </div>
        </Secao>

        <Secao titulo="3. Progresso do cronograma">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-medium w-28">Progresso geral</span>
            <BarraProgresso percentual={cronograma.progressoGeral} />
            <span className="text-sm font-semibold w-12 text-right">{formatPercent(cronograma.progressoGeral)}</span>
          </div>
          {cronograma.etapas.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhuma etapa cadastrada no cronograma.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Etapa</Th>
                  <Th>Status</Th>
                  <Th>Previsto</Th>
                  <Th>Real</Th>
                  <Th className="text-right">Progresso</Th>
                </tr>
              </thead>
              <tbody>
                {cronograma.etapas.map((etapa) => (
                  <tr key={etapa.id} className="break-inside-avoid">
                    <Td className="font-medium">{etapa.nome}</Td>
                    <Td className={etapa.status === "ATRASADA" ? "text-red-600 font-medium" : ""}>
                      {STATUS_ETAPA_LABELS[etapa.status] ?? etapa.status}
                    </Td>
                    <Td>
                      {formatDate(etapa.dataPrevistaInicio)} – {formatDate(etapa.dataPrevistaFim)}
                    </Td>
                    <Td>
                      {etapa.dataRealInicio
                        ? `${formatDate(etapa.dataRealInicio)} – ${etapa.dataRealFim ? formatDate(etapa.dataRealFim) : "em curso"}`
                        : "—"}
                    </Td>
                    <Td className="text-right">{formatPercent(etapa.percentualProgresso)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Secao>

        <Secao titulo="4. Resumo financeiro">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mb-5">
            <Campo
              label="Orçamento"
              valor={financeiro.orcamento != null ? formatCurrency(financeiro.orcamento) : "Não definido"}
            />
            <Campo label="Total gasto" valor={formatCurrency(financeiro.totalGasto)} />
            <Campo
              label="Saldo restante"
              valor={financeiro.saldoRestante != null ? formatCurrency(financeiro.saldoRestante) : "—"}
              destaque={saldoNegativo}
            />
            <Campo label="Total pago" valor={formatCurrency(resumo.totalPago)} />
            <Campo label="A pagar (pendente)" valor={formatCurrency(resumo.totalPendente)} />
            <Campo
              label="Situação"
              valor={SITUACAO_FINANCEIRA_LABELS[financeiro.situacao] ?? financeiro.situacao}
              destaque={situacaoRuim}
            />
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <Th>Categoria</Th>
                <Th className="text-right">Lançamentos</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right">% do orçamento</Th>
              </tr>
            </thead>
            <tbody>
              {financeiro.gastosPorCategoria.map((g) => (
                <tr key={g.categoria}>
                  <Td>{CATEGORIA_CUSTO_LABELS[g.categoria] ?? g.categoria}</Td>
                  <Td className="text-right">{g.quantidade}</Td>
                  <Td className="text-right">{formatCurrency(g.total)}</Td>
                  <Td className="text-right">{formatPercent(g.percentualOrcamento)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-zinc-500 mt-2">Lançamentos cancelados não entram no total gasto.</p>
        </Secao>

        <Secao titulo="5. Lançamentos de custo">
          {custos.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum custo lançado para esta obra.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Data</Th>
                  <Th>Descrição</Th>
                  <Th>Categoria</Th>
                  <Th>Fornecedor</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Valor</Th>
                </tr>
              </thead>
              <tbody>
                {custos.map((c) => (
                  <tr key={c.id} className={`break-inside-avoid ${c.status === "CANCELADO" ? "text-zinc-400" : ""}`}>
                    <Td>{formatDate(c.data)}</Td>
                    <Td>
                      {c.descricao}
                      {c.possuiAnexo && <span className="text-xs text-zinc-500"> (orçamento/nota anexado)</span>}
                    </Td>
                    <Td>{CATEGORIA_CUSTO_LABELS[c.categoria] ?? c.categoria}</Td>
                    <Td>{c.fornecedorNome ?? "—"}</Td>
                    <Td>{STATUS_CUSTO_LABELS[c.status] ?? c.status}</Td>
                    <Td className={`text-right ${c.status === "CANCELADO" ? "line-through" : ""}`}>
                      {formatCurrency(c.valor)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Secao>

        <footer className="mt-10 border-t border-zinc-300 pt-3 text-[11px] text-zinc-500 flex justify-between">
          <span>Documento gerado pelo sistema Gestor de Obras.</span>
          <span>Uso interno e restrito — André Paulino Negócios Imobiliários.</span>
        </footer>
      </article>
    </div>
  );
}
