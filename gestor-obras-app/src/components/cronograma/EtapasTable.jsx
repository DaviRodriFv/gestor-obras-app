import { formatDate } from "../../utils/format";
import EtapaStatusBadge from "./EtapaStatusBadge";
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

export default function EtapasTable({ etapas, onSelect }) {
  const { pageItems, setPage, ...paginacao } = usePagination(etapas);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Início Previsto</TableHead>
            <TableHead>Fim Previsto</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((etapa) => (
            <TableRow
              key={etapa.id}
              className="cursor-pointer"
              onClick={() => onSelect(etapa)}
            >
              <TableCell className="font-medium">{etapa.nome}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(etapa.dataPrevistaInicio)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(etapa.dataPrevistaFim)}
              </TableCell>
              <TableCell className="text-muted-foreground">{etapa.percentualProgresso}%</TableCell>
              <TableCell>
                <EtapaStatusBadge status={etapa.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination {...paginacao} onPageChange={setPage} />
    </>
  );
}
