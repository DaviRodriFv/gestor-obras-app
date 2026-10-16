# Caso de Uso: EmitirRelatorios

**Ator**: Administrador (Proprietário)

**Breve descrição**: emissão do relatório de progresso e financeiro de uma obra, para ser apresentado a clientes e investidores. O relatório reúne em um único documento os dados da obra, o andamento do cronograma e a situação financeira (orçamento × gasto real), e pode ser impresso ou salvo em PDF. Atende ao pedido do investidor de "gerar relatórios de progresso e financeiros para clientes/investidores". O caso de uso só consulta informações dos demais módulos — nada é alterado.

## Condições prévias
Usuário logado com conta ativa de status administrador **e** existir ao menos uma obra cadastrada (via `GerenciarObras`). O relatório usa as informações registradas em `GerenciarCronograma`, `GerenciarCustos` e `DashboardFinanceiro`; se ainda não houver etapas, custos ou orçamento, as seções correspondentes saem vazias.

## Fluxo básico — Emitir relatório da obra
1. Administrador acessa a área de relatórios.
2. Seleciona a obra.
3. Aciona "emitir relatório".
4. Sistema reúne os dados da obra, do cronograma, do resumo financeiro e dos lançamentos de custo, e calcula os indicadores do relatório.
5. Sistema apresenta o relatório em uma página própria, com layout de documento (folha branca, formato A4), contendo:
   - **Cabeçalho**: nome da obra, data/hora de emissão e quem emitiu;
   - **Dados da obra**: cliente, endereço, status, data de início, prazo de conclusão e alerta de prazo;
   - **Resumo**: percentual de progresso, etapas concluídas/total, etapas atrasadas, percentual do orçamento consumido e situação financeira;
   - **Progresso do cronograma**: progresso geral e tabela de etapas (status, datas previstas, datas reais, progresso individual);
   - **Resumo financeiro**: orçamento, total gasto, saldo restante, total pago, total pendente, situação e gasto por categoria (total, quantidade de lançamentos e percentual do orçamento);
   - **Lançamentos de custo**: data, descrição, categoria, fornecedor, status e valor de cada lançamento, indicando os que possuem orçamento/nota anexado.
6. Administrador aciona "imprimir / salvar PDF" e o navegador abre a janela de impressão, onde o relatório pode ser impresso ou salvo como arquivo PDF.

## Fluxos alternativos

### Emitir relatório a partir do Dashboard Financeiro (ponto de extensão)
1. Administrador está no `DashboardFinanceiro` de uma obra.
2. Aciona "emitir relatório".
3. Sistema apresenta o relatório da obra selecionada (passos 4 e 5 do fluxo básico), sem precisar escolher a obra novamente.

### Obra sem cronograma, custos ou orçamento
1. No passo 4 do fluxo básico, a obra ainda não tem etapas, lançamentos ou orçamento definido.
2. Sistema gera o relatório mesmo assim: o progresso aparece como 0%, as tabelas vazias exibem "nenhuma etapa cadastrada" / "nenhum custo lançado" e a situação financeira aparece como "Sem Orçamento".

### Obra não encontrada
1. A obra selecionada foi excluída por outro usuário antes da emissão.
2. Sistema informa "Obra não encontrada" e oferece voltar para a seleção de obras.

### Usuário sem permissão
1. Usuário com perfil Equipe tenta acessar a área de relatórios.
2. Sistema não exibe a opção no menu e nega o acesso (o relatório contém dados financeiros, restritos ao administrador).

## Regras de negócio
- **Total gasto** e **gasto por categoria** desconsideram os lançamentos cancelados (mesma regra do `DashboardFinanceiro`).
- **Total pago** soma os lançamentos com status Pago; **total pendente** soma os lançamentos com status Pendente.
- **Alerta de prazo**: para obras Em Andamento ou Pausadas, o relatório mostra "Prazo vencido há N dia(s)" quando o prazo já passou e destaca "Faltam N dia(s) para o prazo" quando faltam 30 dias ou menos. Obras Concluídas ou Canceladas não exibem alerta.
- **Etapas atrasadas** são as etapas com status Atrasada no cronograma.
- O relatório reflete os dados no momento da emissão; a data/hora de emissão é registrada no cabeçalho.

## Cenários chave
Emitir relatório de uma obra com cronograma e custos; emitir relatório a partir do Dashboard Financeiro; emitir relatório de obra sem dados de cronograma/custo/orçamento; salvar o relatório em PDF; acesso negado ao perfil Equipe.

## Condições posteriores
Relatório da obra exibido e, se o administrador desejar, impresso ou salvo em PDF. Nenhum dado do sistema é alterado.

## Pontos de extensão / requisitos especiais
- **Ponto de extensão**: estende `DashboardFinanceiro` (`DashboardFinanceiro <<extend>> Emitir Relatórios`), pela opção "emitir relatório" no painel financeiro da obra.
- **Segurança**: acesso exclusivo do administrador, pois o relatório contém dados financeiros (Pedido do Investidor — controle de acesso por perfil).
- **Desempenho**: o relatório deve ser gerado em até 3 segundos (Documento de Visão).
- **Interface**: toda em português; layout próprio para impressão em A4, sem menus nem botões no documento impresso.
- **Fora do escopo da v1**: relatório de fornecedores e exportação em CSV (citados como possibilidade futura na Especificação Complementar).

---
Fonte: especificação elaborada durante o desenvolvimento (não há PDF original deste caso de uso em `originais/casos-de-uso/`). Base nos requisitos do [Pedido do Investidor](../pedido-investidor.md), da [Especificação Complementar](../especificacao-complementar.md) e no [diagrama de casos de uso](../diagrama-casos-de-uso.md).
