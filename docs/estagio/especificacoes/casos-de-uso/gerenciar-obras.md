# Caso de Uso: GerenciarObras

**Ator**: Administrador

**Breve descrição**: cadastro, visualização, edição, alteração de status e exclusão de obras de construção civil. Sistema disponibiliza dashboard com visão consolidada de todas as obras ativas e seus status.

## Condições prévias
Usuário logado com conta ativa de status administrador.

## Fluxo básico — Cadastrar obra
1. Administrador seleciona "cadastrar obra".
2. Informa dados: nome, endereço, cliente responsável, data de início, prazo previsto de conclusão, status.
3. Seleciona status inicial (Em Andamento, Concluída ou Pausada).
4. Confirma o cadastro.
5. Sistema salva a nova obra.

## Fluxos alternativos

### Editar obra
1. Administrador entra na área de gerenciar obras.
2. Localiza a obra na tabela (filtro por status ou busca por nome/cliente).
3. Abre modal com dados da obra, altera o que for necessário.
4. Salva alterações.

### Visualizar obra
1. Administrador entra na área de gerenciar obras.
2. Localiza a obra na tabela (filtro por status ou busca por nome/cliente).
3. Clica na obra.
4. Modal abre com informações e opções de controle disponíveis.

### Alterar status / excluir obra
1. Administrador entra na área de gerenciar obras.
2. Seleciona a obra na tabela.
3. No modal, altera o status (Em Andamento, Concluída, Pausada) ou aciona excluir.
4. Excluir pede confirmação em modal; ao confirmar, a obra é removida do banco.

## Cenários chave
Cadastrar obra com dados obrigatórios; editar obra existente; alterar status; excluir obra.

## Condições posteriores
Obra cadastrada/editada/com status alterado/excluída. Obras aparecem no dashboard e em módulos dependentes (controle financeiro, cronograma).

## Pontos de extensão / requisitos especiais
Não se aplica.

---
Fonte original: [`../../originais/casos-de-uso/Espec_UseCase_ucGerenObras.docx.pdf`](../../originais/casos-de-uso/Espec_UseCase_ucGerenObras.docx.pdf)
