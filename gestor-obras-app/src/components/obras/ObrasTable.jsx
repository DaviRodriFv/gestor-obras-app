import { formatDate } from "../../utils/format";
import StatusBadge from "./StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function ObrasTable({ obras, onSelect }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Endereço</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data Início</TableHead>
          <TableHead>Prazo</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {obras.map((obra) => (
          <TableRow
            key={obra.id}
            className="cursor-pointer"
            onClick={() => onSelect(obra)}
          >
            <TableCell className="font-medium">{obra.nome}</TableCell>
            <TableCell className="text-muted-foreground">{obra.endereco}</TableCell>
            <TableCell className="text-muted-foreground">{obra.cliente}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(obra.dataInicio)}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(obra.prazoConclusao)}</TableCell>
            <TableCell>
              <StatusBadge status={obra.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
