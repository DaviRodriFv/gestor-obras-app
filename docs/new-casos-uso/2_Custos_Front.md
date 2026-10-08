Você vai implementar o **front-end** do caso de uso **GerenciarCustos** no **Gestor de Obras**, meu projeto de estágio (back-end Spring Boot + JPA + PostgreSQL, front-end React). Os casos de uso **GerenciarObras, GerenciarFuncionarios, GerenciarCronograma e GerenciarFornecedores já estão prontos**. A tela **Custos** já existe no menu, mas está vazia.

Esta é a **parte 2 de 4**. A parte 1 (back-end de Custos) já foi feita. Depois desta vêm o back-end e o front-end do DashboardFinanceiro. **Neste prompt, mexa só no front-end.**

---

## 1. Pré-requisito: confira o back-end

Antes de começar, confirme que estes endpoints existem no back-end. **Não altere o back-end.** Se algum estiver faltando ou diferente, pare e me avise.

| Método | Rota |
|---|---|
| GET | `/api/obras/{obraId}/custos?categoria=&status=&busca=` |
| GET | `/api/obras/{obraId}/custos/{id}` |
| POST | `/api/obras/{obraId}/custos` |
| PUT | `/api/obras/{obraId}/custos/{id}` |
| PATCH | `/api/obras/{obraId}/custos/{id}/status` (body `{ "status": "PAGO" }`) |
| DELETE | `/api/obras/{obraId}/custos/{id}` |
| GET | `/api/obras/{obraId}/custos/por-categoria` → `[{ categoria, total, quantidade, percentualOrcamento }]` |

`CustoResponseDTO`: `id, obraId, categoria, valor, data, descricao, status, fornecedorId, fornecedorNome, criadoEm`.
Enums: `CategoriaCusto` (`MATERIAL`, `MAO_DE_OBRA`, `SERVICO_TERCEIRIZADO`) e `StatusCusto` (`PENDENTE`, `PAGO`, `CANCELADO`).

---

## 2. Explore o front-end antes de escrever código

Replique os padrões que já estão em uso. Não crie padrões novos. Veja:

- A estrutura de páginas e rotas, e onde está a página vazia de Custos.
- O cliente de API e como as outras telas tratam erros.
- Os componentes de seleção de obra (tela Cronograma), tabela, modal e modal de confirmação (telas Obras e Fornecedores).
- Se já existe biblioteca de gráficos.
- Como o menu é montado e se ele já esconde itens conforme o perfil (`ADMINISTRADOR` / `EQUIPE`).

---

## 3. Regras gerais

- Mantenha o mesmo visual das telas existentes (tema escuro, mesmos componentes, textos em português).
- Valores em `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, datas em `dd/MM/yyyy`.
- Rótulos das categorias: `Material`, `Mão de Obra`, `Serviço Terceirizado`. Rótulos dos status: `Pendente`, `Pago`, `Cancelado`. Centralize esses rótulos e o formatador de moeda num lugar reutilizável, porque a tela Financeiro (parte 4) vai usar os mesmos.
- Mostre os erros da API do mesmo jeito que as outras telas mostram.
- **Permissão:** se o menu já esconde itens por perfil, esconda **Custos** para `EQUIPE`. Se não esconde, não crie esse mecanismo; só me avise.

---

## 4. Tela Custos

- **Seletor de obra** igual ao do Cronograma. Enquanto nenhuma obra estiver selecionada, mostre o estado vazio "Selecione uma obra para ver os custos."
- **Resumo por categoria** (dados de `/custos/por-categoria`):
  - 3 cartões, um por categoria: valor total, quantidade de lançamentos e % do orçamento. Mostre "—" quando `percentualOrcamento` vier `null`, ou seja, quando a obra ainda não tem orçamento.
  - Um **gráfico de pizza** com a distribuição entre as categorias. Use a biblioteca de gráficos que já existir no projeto. Se não houver nenhuma, adicione `recharts`.
  - Clicar em uma categoria (no cartão ou na fatia) filtra a tabela.
- **Tabela de custos**: descrição, categoria, fornecedor, data, valor e status. Busca por descrição e filtros por categoria e status.
- Botão **Novo Lançamento**, que abre o modal de lançamento com estes campos:
  - descrição
  - valor
  - data
  - categoria
  - fornecedor (select com os fornecedores ativos, opcional)
  - status inicial (Pendente ou Pago)
- **Faça desse modal um componente reutilizável**, que receba `obraId` e um callback `onSalvo`. A tela Financeiro (parte 4) vai abrir o mesmo modal pelo botão "Novo Lançamento".
- Clicar numa linha abre um modal com os detalhes e as ações:
  - **Editar** (reaproveita o modal de lançamento, preenchido)
  - **Registrar pagamento** e **Cancelar lançamento**, só quando o status for Pendente
  - **Excluir**, com modal de confirmação
- Depois de qualquer alteração, recarregue a tabela e o resumo por categoria.

Não mexa na página **Dashboard** (visão geral de todas as obras) nem na página **Financeiro** (parte 4).

---

## 5. Verificação

- O front-end precisa passar em `npm run build` (e no lint, se existir).
- Suba front e back e faça um teste manual: lançar custos nas 3 categorias, com e sem fornecedor; editar um; registrar pagamento de um; cancelar outro; excluir um. Confira se os cartões, o gráfico e os filtros batem.

**Não mexa no back-end.** **Não faça commit nem push.** Deixe as alterações para eu revisar.

---

## 6. Resumo final que eu preciso

1. Arquivos criados e alterados.
2. Dependências adicionadas, se houver.
3. Onde ficou o modal de lançamento reutilizável e como usá-lo (props).
4. Qualquer ponto em que você precisou adaptar este pedido ao código existente.
