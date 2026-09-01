# Caso de Uso: GerenciarFornecedores

**Ator**: Administrador

**Breve descrição**: cadastro, visualização, edição e exclusão de fornecedores que prestam serviços/materiais às obras. Além dos dados de contato, o sistema mantém o vínculo entre cada fornecedor e as obras em que atuou, possibilitando consulta ao histórico de fornecimento.

## Condições prévias
Usuário logado com conta ativa de status administrador. Para vincular fornecedor a uma obra, é necessário que exista ao menos uma obra previamente cadastrada (via `GerenciarObras`).

## Fluxo básico — Cadastrar fornecedor
1. Administrador acessa a área de fornecedores.
2. Seleciona "cadastrar fornecedor".
3. Informa dados: nome/razão social, tipo de serviço prestado, telefone, e-mail, endereço.
4. Vincula o fornecedor às obras em que atua (quando aplicável).
5. Confirma o cadastro.
6. Sistema valida os dados e salva o novo fornecedor.

## Fluxos alternativos

### Editar fornecedor
1. Administrador entra na área de fornecedores.
2. Localiza o fornecedor na tabela (filtro por tipo de serviço ou busca por nome).
3. Modal abre com dados para edição (telefone, e-mail, tipo de serviço etc.).
4. Salva alterações — sistema atualiza o fornecedor no banco.

### Visualizar fornecedor
1. Administrador entra na área de fornecedores.
2. Sistema apresenta tabela com nome, tipo de serviço, telefone, e-mail e quantidade de obras vinculadas.
3. Localiza fornecedor (filtro ou busca).
4. Clica no fornecedor — modal com informações completas, histórico de obras vinculadas e opções de controle.

### Vincular fornecedor a uma obra
1. Administrador seleciona o fornecedor.
2. No modal, aciona "vincular a uma obra".
3. Sistema apresenta lista de obras cadastradas para seleção.
4. Ao confirmar, sistema registra o vínculo, atualiza histórico do fornecedor e a contagem de obras vinculadas na listagem.

### Excluir fornecedor
1. Administrador seleciona o fornecedor na tabela.
2. Aciona excluir — modal de confirmação.
3. Ao confirmar, fornecedor é removido do banco, mas os lançamentos financeiros já registrados permanecem preservados.

### Registrar orçamento do fornecedor
1. Administrador seleciona o fornecedor e abre a aba/seção de orçamentos.
2. Aciona "novo orçamento" e seleciona a obra à qual o orçamento se refere.
3. Informa os dados do orçamento, podendo combinar:
   - **Tabela de itens**: um ou mais materiais/serviços, cada um com descrição, quantidade e preço unitário — o sistema calcula o subtotal de cada item e o valor total do orçamento automaticamente;
   - **Documento anexo**: upload de um arquivo PDF (proposta comercial do fornecedor).
   - É obrigatório informar ao menos um dos dois (tabela de itens ou arquivo PDF). Caso não haja itens detalhados, o valor total deve ser informado manualmente.
4. Confirma o cadastro — sistema salva o orçamento vinculado ao fornecedor e à obra.

### Consultar / editar / excluir orçamento
1. Administrador entra na área de orçamentos do fornecedor.
2. Visualiza a lista de orçamentos (obra vinculada, data, valor total, se possui anexo).
3. Pode abrir um orçamento para ver os itens detalhados e baixar o arquivo PDF anexado, quando houver.
4. Pode editar os itens, a obra vinculada, a data ou substituir o arquivo anexado — o valor total é recalculado quando a tabela de itens é alterada.
5. Pode excluir o orçamento, com confirmação em modal.

## Cenários chave
Cadastrar fornecedor com dados obrigatórios; consultar listagem com filtro por tipo de serviço; editar fornecedor existente; vincular fornecedor a obra; excluir fornecedor; registrar orçamento de um fornecedor para uma obra, com tabela de itens (material/quantidade/preço) e/ou PDF anexado.

## Condições posteriores
Fornecedores cadastrados ficam disponíveis para consulta e vinculação nos lançamentos de custos das obras, e no relatório de fornecedores. Orçamentos cadastrados ficam disponíveis para consulta na obra e no fornecedor, servindo de base para a comparação entre orçado e gasto real.

## Pontos de extensão / requisitos especiais
Não se aplica.

---
Fonte original: [`../../originais/casos-de-uso/Espec_UseCase_ucGerenciarFornecedores.pdf`](../../originais/casos-de-uso/Espec_UseCase_ucGerenciarFornecedores.pdf)
