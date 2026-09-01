export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export const STATUS_LABELS = {
  EM_ANDAMENTO: "Em Andamento",
  PAUSADA: "Pausada",
  CONCLUIDA: "Concluída",
  CANCELADA: "Cancelada",
};

export const STATUS_TRANSITIONS = {
  EM_ANDAMENTO: ["PAUSADA", "CONCLUIDA", "CANCELADA"],
  PAUSADA: ["EM_ANDAMENTO", "CONCLUIDA", "CANCELADA"],
  CONCLUIDA: [],
  CANCELADA: [],
};

export const STATUS_TERMINAL = ["CONCLUIDA", "CANCELADA"];

export const STATUS_ETAPA_LABELS = {
  NAO_INICIADA: "Não Iniciada",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDA: "Concluída",
  ATRASADA: "Atrasada",
};
