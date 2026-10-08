import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CATEGORIA_CUSTO_LABELS, CATEGORIA_CUSTO_COLORS, formatCurrency } from "../../utils/format";

export default function CustosPorCategoriaChart({ dados, onSelectCategoria }) {
  const data = dados
    .filter((d) => d.total > 0)
    .map((d) => ({
      categoria: d.categoria,
      nome: CATEGORIA_CUSTO_LABELS[d.categoria] ?? d.categoria,
      valor: d.total,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-56 text-sm text-muted-foreground">
        Nenhum custo lançado ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="valor"
          nameKey="nome"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={2}
          cornerRadius={4}
          cursor="pointer"
          onClick={(entry) => onSelectCategoria(entry.categoria)}
        >
          {data.map((entry) => (
            <Cell key={entry.categoria} fill={CATEGORIA_CUSTO_COLORS[entry.categoria]} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value)}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.3125rem",
            color: "hsl(var(--foreground))",
            fontSize: "0.875rem",
          }}
        />
        <Legend formatter={(value) => <span style={{ color: "hsl(var(--foreground))" }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
