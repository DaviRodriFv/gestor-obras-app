export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "—";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

export const CATEGORIA_CUSTO_LABELS = {
  MATERIAL: "Material",
  MAO_DE_OBRA: "Mão de Obra",
  SERVICO_TERCEIRIZADO: "Serviço Terceirizado",
};

// Paleta categórica validada (CVD-safe) contra o fundo escuro dos cards (#2e292a).
export const CATEGORIA_CUSTO_COLORS = {
  MATERIAL: "#3987e5",
  MAO_DE_OBRA: "#d95926",
  SERVICO_TERCEIRIZADO: "#199e70",
};

export const STATUS_CUSTO_LABELS = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
};

export const SITUACAO_FINANCEIRA_LABELS = {
  SEM_ORCAMENTO: "Sem Orçamento",
  DENTRO_DO_ORCAMENTO: "Dentro do Orçamento",
  EM_ALERTA: "Em Alerta",
  ORCAMENTO_EXCEDIDO: "Orçamento Excedido",
};
