import { Pencil } from "lucide-react";
import { formatDate } from "../../utils/format";
import StatusBadge from "./StatusBadge";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Pagination } from "../ui/pagination";
import { usePagination } from "../../hooks/usePagination";

export default function ObrasTable({ obras, onSelect, onEdit }) {
  const { pageItems, setPage, ...paginacao } = usePagination(obras);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data Início</TableHead>
            <TableHead>Prazo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((obra) => (
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
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Editar obra"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(obra);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination {...paginacao} onPageChange={setPage} />
    </>
  );
}
