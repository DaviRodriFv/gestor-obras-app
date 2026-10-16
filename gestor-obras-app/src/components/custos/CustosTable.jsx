import { Paperclip } from "lucide-react";
import { formatDate, formatCurrency, CATEGORIA_CUSTO_LABELS } from "../../utils/format";
import CustoStatusBadge from "./CustoStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function CustosTable({ custos, onSelect }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Fornecedor</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {custos.map((custo) => (
          <TableRow key={custo.id} className="cursor-pointer" onClick={() => onSelect(custo)}>
            <TableCell className="font-medium">
              <span className="flex items-center gap-1.5">
                {custo.descricao}
                {custo.possuiAnexo && (
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-label="Possui anexo" />
                )}
              </span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {CATEGORIA_CUSTO_LABELS[custo.categoria] ?? custo.categoria}
            </TableCell>
            <TableCell className="text-muted-foreground">{custo.fornecedorNome ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(custo.data)}</TableCell>
            <TableCell className="text-muted-foreground">{formatCurrency(custo.valor)}</TableCell>
            <TableCell>
              <CustoStatusBadge status={custo.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
