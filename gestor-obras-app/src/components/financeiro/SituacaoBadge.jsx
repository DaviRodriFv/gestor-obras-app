import { cn } from "../../lib/utils";
import { SITUACAO_FINANCEIRA_LABELS } from "../../utils/format";

const SITUACAO_STYLES = {
  SEM_ORCAMENTO: "bg-muted text-muted-foreground border-transparent",
  DENTRO_DO_ORCAMENTO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  EM_ALERTA: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ORCAMENTO_EXCEDIDO: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function SituacaoBadge({ situacao }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        SITUACAO_STYLES[situacao] ?? "bg-muted text-muted-foreground border-transparent"
      )}
    >
      {SITUACAO_FINANCEIRA_LABELS[situacao] ?? situacao}
    </span>
  );
}
