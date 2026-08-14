# Caso de Uso: GerenciarCronograma

**Ator**: Administrador

**Breve descrição**: cadastro, visualização, edição e exclusão das etapas que compõem o cronograma de cada obra. Cada etapa registra status, datas previstas/reais de início e término e percentual de progresso individual; o sistema calcula e apresenta o progresso geral da obra a partir dessas etapas.

## Condições prévias
Usuário logado com conta ativa de status administrador **e** existir ao menos uma obra previamente cadastrada (via `GerenciarObras`) — toda etapa de cronograma está obrigatoriamente vinculada a uma obra.

## Fluxo básico — Cadastrar etapa
1. Administrador acessa a área de cronograma.
2. Seleciona a obra cujo cronograma deseja gerenciar.
3. Sistema exibe o progresso geral da obra e a lista de etapas já cadastradas.
4. Administrador seleciona "cadastrar nova etapa".
5. Informa dados: nome, descrição, data prevista de início, data prevista de término.
6. Seleciona status inicial (Não Iniciada, Em Andamento, Concluída ou Atrasada).
7. Confirma o cadastro.
8. Sistema valida os dados, salva a etapa e recalcula o percentual de progresso geral da obra.

## Fluxos alternativos

### Editar etapa do cronograma
1. Administrador entra na área de cronograma.
2. Seleciona a obra e localiza a etapa (filtro por status ou busca por nome).
3. Modal abre com dados para edição (nome, descrição, datas previstas).
4. Salva alterações — sistema atualiza a etapa no banco.

### Visualizar cronograma
1. Administrador entra na área de cronograma.
2. Seleciona a obra na lista.
3. Sistema apresenta % de progresso geral e tabela de etapas (status, datas previstas, datas reais, progresso individual).
4. Clica em uma etapa para ver detalhes e opções de controle.

### Atualizar progresso da etapa
1. Administrador seleciona a obra e a etapa.
2. No modal, informa data real de início/término e ajusta o percentual de progresso.
3. Altera o status da etapa quando aplicável.
4. Ao confirmar, sistema salva e recalcula o progresso geral da obra (refletido no dashboard).

### Excluir etapa do cronograma
1. Administrador seleciona a obra e a etapa.
2. Aciona excluir — modal de confirmação.
3. Ao confirmar, etapa é removida e o progresso geral da obra é recalculado.

## Cenários chave
Cadastrar etapa com dados obrigatórios; visualizar cronograma completo de uma obra; editar etapa existente; atualizar datas reais e progresso; excluir etapa.

## Condições posteriores
Etapas cadastradas compõem o cronograma da obra; progresso resultante é refletido no dashboard e nos relatórios de acompanhamento.

## Pontos de extensão / requisitos especiais
Não se aplica.

---
Fonte original: [`../../originais/casos-de-uso/Espec_UseCase_ucGerenciarCronograma.pdf`](../../originais/casos-de-uso/Espec_UseCase_ucGerenciarCronograma.pdf)
