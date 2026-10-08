import { cn } from "../../lib/utils";
import { STATUS_CUSTO_LABELS } from "../../utils/format";

const STATUS_STYLES = {
  PENDENTE: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  PAGO: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CANCELADO: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function CustoStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-transparent"
      )}
    >
      {STATUS_CUSTO_LABELS[status] ?? status}
    </span>
  );
}
