import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function FornecedoresTable({ fornecedores, onSelect }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo de Serviço</TableHead>
          <TableHead>Telefone</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Obras Vinculadas</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fornecedores.map((fornecedor) => (
          <TableRow
            key={fornecedor.id}
            className="cursor-pointer"
            onClick={() => onSelect(fornecedor)}
          >
            <TableCell className="font-medium">{fornecedor.nome}</TableCell>
            <TableCell className="text-muted-foreground">{fornecedor.tipoServico}</TableCell>
            <TableCell className="text-muted-foreground">{fornecedor.telefone}</TableCell>
            <TableCell className="text-muted-foreground">{fornecedor.email}</TableCell>
            <TableCell className="text-muted-foreground">
              {fornecedor.obrasVinculadas?.length ?? 0}
            </TableCell>
            <TableCell>
              <Badge variant={fornecedor.ativo ? "default" : "outline"}>
                {fornecedor.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
