import { cn } from "../../lib/utils";
import { STATUS_LABELS } from "../../utils/format";

const STATUS_STYLES = {
  EM_ANDAMENTO: "bg-gray-900 text-white border-transparent",
  PAUSADA: "bg-rose-100 text-rose-700 border-transparent",
  CONCLUIDA: "bg-gray-100 text-gray-500 border-transparent",
  CANCELADA: "bg-red-900/20 text-red-800 border-transparent",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_STYLES[status] ?? "bg-muted text-muted-foreground border-transparent"
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
