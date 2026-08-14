# Diagrama de Casos de Uso — Visão Geral

Imagem original: [`../diagramas/UseCase Diagram.png`](../diagramas/UseCase%20Diagram.png)

## Atores
- **Administrador** → generaliza para **Equipe**
- **Proprietário** → generaliza para **Equipe**
- **Equipe** (ator base, herdado por Administrador e Proprietário)

## Casos de uso e quem acessa
| Caso de uso | Acessado por | Especificado? |
|---|---|---|
| GerenciarFuncionários | Administrador, Equipe | ✅ `casos-de-uso/gerenciar-funcionarios.md` |
| GerenciarObras | Equipe | ✅ `casos-de-uso/gerenciar-obras.md` |
| GerenciarCronogramas | Equipe | ✅ `casos-de-uso/gerenciar-cronograma.md` |
| DashboardFinanceiro | Equipe, Proprietário | ⏳ ainda não especificado |
| GerenciarCustos | Proprietário | ⏳ ainda não especificado |
| Emitir Relatórios | (via `<<extend>>` de DashboardFinanceiro) | ⏳ ainda não especificado |
| GerenciarFornecedores | Proprietário | ✅ `casos-de-uso/gerenciar-fornecedores.md` |

## Relações de extensão (`<<extend>>`)
- `DashboardFinanceiro` `<<extend>>` `Emitir Relatórios`
- `DashboardFinanceiro` `<<extend>>` `GerenciarCustos`

## Nota
`GerenciarCustos`, `DashboardFinanceiro` e `Emitir Relatórios` aparecem no diagrama mas ainda não têm especificação de caso de uso própria em `casos-de-uso/`. Ao criá-las, adicionar aqui e importar no [CLAUDE.md](../../../CLAUDE.md) da raiz.
