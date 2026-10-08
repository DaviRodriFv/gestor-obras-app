Você vai implementar o **front-end** do caso de uso **DashboardFinanceiro** no **Gestor de Obras**, meu projeto de estágio (back-end Spring Boot + JPA + PostgreSQL, front-end React). Os casos de uso **GerenciarObras, GerenciarFuncionarios, GerenciarCronograma, GerenciarFornecedores e GerenciarCustos já estão prontos**. A tela **Financeiro** já existe no menu, mas está vazia.

Esta é a **parte 4 de 4**. As partes anteriores (back-end e front-end de Custos, back-end do DashboardFinanceiro) já foram feitas. **Neste prompt, mexa só no front-end.**

---

## 1. Pré-requisito: confira o que já existe

**Back-end.** Confirme que estes endpoints existem. **Não altere o back-end.** Se algum estiver faltando ou diferente, pare e me avise.

| Método | Rota | Retorno |
|---|---|---|
| GET | `/api/obras/{obraId}/financeiro` | `{ obraId, obraNome, orcamento, totalGasto, saldoRestante, percentualConsumido, situacao, gastosPorCategoria[] }` |
| PUT | `/api/obras/{obraId}/orcamento` (body `{ "valor": 150000.00 }`) | dashboard recalculado |
| GET | `/api/obras/{obraId}/custos?categoria=` | lista de custos |

`situacao`: `SEM_ORCAMENTO`, `DENTRO_DO_ORCAMENTO`, `EM_ALERTA` ou `ORCAMENTO_EXCEDIDO`.
`gastosPorCategoria[]`: `{ categoria, total, quantidade, percentualOrcamento }`.
Os campos `saldoRestante` e `percentualConsumido` vêm `null` quando a obra não tem orçamento.

**Front-end.** Localize o que a parte 2 deixou pronto na tela Custos e **reutilize, sem duplicar**:
- o **modal de lançamento** (recebe `obraId` e um callback `onSalvo`)
- os rótulos de categoria e status
- o formatador de moeda

---

## 2. Explore o front-end antes de escrever código

Replique os padrões que já estão em uso. Não crie padrões novos. Veja:

- A estrutura de páginas e rotas, e onde está a página vazia de Financeiro.
- O cliente de API e como as outras telas tratam erros.
- Os componentes de seleção de obra (tela Cronograma), cartões, tabela, modal e barra de progresso (o Cronograma já tem barra de progresso).
- Como o menu é montado e se ele já esconde itens conforme o perfil.

---

## 3. Regras gerais

- Mantenha o mesmo visual das telas existentes (tema escuro, mesmos componentes, textos em português).
- Valores em BRL e datas em `dd/MM/yyyy`, usando os mesmos utilitários da tela Custos.
- Mostre os erros da API do mesmo jeito que as outras telas mostram.
- **Permissão:** se o menu já esconde itens por perfil, esconda **Financeiro** para `EQUIPE`. Se não esconde, não crie esse mecanismo; só me avise.

---

## 4. Tela Financeiro

- **Seletor de obra** igual ao do Cronograma. Enquanto nenhuma obra estiver selecionada, mostre o estado vazio "Selecione uma obra para ver o resumo financeiro."
- **4 cartões:**
  - **Orçamento Total**, com botão para definir/editar, que abre um modal com o valor e chama o `PUT /orcamento`. Valide no front que o valor é maior que zero.
  - **Total Gasto**.
  - **Saldo Restante**, em vermelho quando negativo e "—" quando `null`.
  - **Percentual Consumido**, com barra de progresso, e "—" quando `null`.
- **Badge da situação** com rótulo e cor por estado: Sem Orçamento (neutro), Dentro do Orçamento (verde), Em Alerta (amarelo) e Orçamento Excedido (vermelho). Quando for Sem Orçamento, mostre um aviso orientando a definir o orçamento.
- **Seção "Gastos por categoria"**, com uma barra de progresso por categoria mostrando o valor e o % do orçamento.
- **Tabela de lançamentos** (descrição, categoria, fornecedor, data, valor, status), com filtro por categoria.
- Botão **Novo Lançamento**, que abre o **mesmo** modal de lançamento da tela Custos. Esse botão é o `<<extend>>` para GerenciarCustos. Depois de salvar, recarregue o painel e a tabela.

Não mexa na página **Dashboard** (visão geral de todas as obras). A tela **Custos** só pode ser alterada se for necessário para extrair algo reutilizável, e precisa continuar funcionando igual.

---

## 5. Verificação

- O front-end precisa passar em `npm run build` (e no lint, se existir).
- Suba front e back e faça um teste manual, de ponta a ponta:
  1. Abra uma obra sem orçamento e confira a situação "Sem Orçamento".
  2. Defina o orçamento.
  3. Lance custos nas 3 categorias, pelo botão daqui e pela tela Custos.
  4. Passe de 80% e confira "Em Alerta"; passe de 100% e confira "Orçamento Excedido" e o saldo negativo.
  5. Cancele um lançamento e confira se o total cai.
  6. Filtre a tabela por categoria.

**Não mexa no back-end.** **Não faça commit nem push.** Deixe as alterações para eu revisar.

---

## 6. Resumo final que eu preciso

1. Arquivos criados e alterados.
2. O que foi reutilizado da tela Custos.
3. Qualquer ponto em que você precisou adaptar este pedido ao código existente.
