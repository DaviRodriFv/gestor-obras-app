# Gestor de Obras

Aplicação para gestão de obras. Frontend em `gestor-obras-app/` (React 19 + Vite + React Router + Tailwind CSS + Axios).

## Comandos

Rodar a partir de `gestor-obras-app/`:
- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — lint (ESLint)
- `npm run preview` — preview do build

## Documentação do estágio (TCC — Gestor de Obras para André Paulino Negócios Imobiliários)

Contexto do projeto em `docs/estagio/`:
- `especificacoes/` — versões em Markdown das specs (sempre carregadas via import abaixo)
- `originais/casos-de-uso/` — PDFs originais das especificações de caso de uso
- `originais/documentos/` — .docx originais (Documento de Visão, Especificação Complementar, Pedido do Investidor)
- `diagramas/` — imagens de diagramas (lidas sob demanda, não ficam sempre carregadas)

### Visão geral do produto (sempre carregado)
@docs/estagio/especificacoes/visao-do-produto.md
@docs/estagio/especificacoes/especificacao-complementar.md
@docs/estagio/especificacoes/pedido-investidor.md
@docs/estagio/especificacoes/diagrama-casos-de-uso.md

### Casos de uso especificados (sempre carregados)
@docs/estagio/especificacoes/casos-de-uso/gerenciar-obras.md
@docs/estagio/especificacoes/casos-de-uso/gerenciar-funcionarios.md
@docs/estagio/especificacoes/casos-de-uso/gerenciar-cronograma.md
@docs/estagio/especificacoes/casos-de-uso/gerenciar-fornecedores.md

**Pendentes** (aparecem no diagrama, ainda sem especificação): `DashboardFinanceiro`, `GerenciarCustos`, `Emitir Relatórios`. Ao especificá-los, criar o `.md` em `casos-de-uso/` e adicionar o import aqui.
