# Handoff para o Claude do frontend (`gestor-obras-app`)

Este documento descreve o estado atual da API do `gestor-obras-api` depois de três mudanças: implementação do módulo **Cronograma**, conclusão do módulo **Fornecedores** (vínculo com obras) e um **refactor de permissões** que estava quebrado. Leia a seção "Breaking change" antes de mexer em qualquer tela de login/permissão.

Base URL local: `http://localhost:8080`. CORS liberado para qualquer origem com credenciais.

---

## 1. Breaking change: `role` foi removido, use `cargo`

O `Funcionario` tinha dois campos de nível de acesso desencontrados: `cargo` (enum `ADMINISTRADOR`/`EQUIPE`, usado em vários lugares) e `role` (string livre, usada só para montar a autoridade do Spring Security, e que por bug ficava sempre `"EQUIPE"` mesmo para o admin — por isso as permissões não faziam efeito nenhum antes).

**O que mudou:** `role` foi removido de todo o contrato de API. `cargo` (`"ADMINISTRADOR"` ou `"EQUIPE"`) é agora a única fonte de verdade de permissão, tanto no banco quanto nas respostas.

Campos afetados:

| Onde                                     | Antes           | Agora                                |
| ---------------------------------------- | --------------- | ------------------------------------ |
| `POST /api/auth/login` (resposta)        | `role: string`  | `cargo: "ADMINISTRADOR" \| "EQUIPE"` |
| `GET /api/auth/me` (resposta)            | `role` no JSON  | `cargo` no JSON                      |
| `Funcionario` (request/response do CRUD) | `role` opcional | campo removido — só existe `cargo`   |

Se o frontend usa `role` para decidir o que renderizar (esconder menu de funcionários, etc.), troque para `cargo === "ADMINISTRADOR"`.

---

## 2. Modelo de permissões

Dois papéis apenas: `ADMINISTRADOR` e `EQUIPE` (enum `TipoCargo`). Nada de `PROPRIETARIO` — esse valor existia antes só no campo `role` legado e nunca teve efeito real.

| Módulo                                                    | ADMINISTRADOR         | EQUIPE                |
| ----------------------------------------------------------- | --------------------- | ---------------------- |
| `/api/funcionarios/**`                                    | ✅ tudo               | ❌ 403 Forbidden       |
| `/api/obras/**` (CRUD + cronograma aninhado)              | ✅                    | ✅                     |
| `/api/obras/{id}/custos/**`                               | ✅                    | ❌ 403 Forbidden       |
| `/api/obras/{id}/financeiro`, `/api/obras/{id}/orcamento` | ✅                    | ❌ 403 Forbidden       |
| `/api/fornecedores/**`                                    | ✅                    | ✅                     |
| `/api/relatorios/**` (ainda não implementado no backend)  | ✅                    | ✅                     |
| `/api/auth/me`                                            | qualquer autenticado  | qualquer autenticado   |

Ou seja: gestão de funcionários, custos e financeiro (orçado x gasto) são admin-only. Obras, cronograma e fornecedores continuam liberados para EQUIPE também.

Isso significa: no frontend, esconda/desabilite as rotas e botões de "Gerenciar Funcionários", "Custos" e "Financeiro" quando `cargo !== "ADMINISTRADOR"`, mas pode manter o resto do app igual para os dois papéis.

### Erros de autenticação/autorização

Antes voltava a página de erro padrão (não-JSON) do Spring. Agora sempre vem JSON:

```json
// 401 — sem token ou token inválido
{ "timestamp": "...", "status": 401, "error": "Unauthorized", "message": "Autenticação necessária", "path": "/api/funcionarios" }

// 403 — autenticado, mas sem permissão (ex: EQUIPE tentando acessar /api/funcionarios)
{ "timestamp": "...", "status": 403, "error": "Forbidden", "message": "Acesso negado: permissão insuficiente para este recurso", "path": "/api/funcionarios" }
```

### Credenciais de teste (seed local, `DataInitializer`)

| Email                 | Senha         | Cargo         |
| --------------------- | ------------- | ------------- |
| `admgestor@gmail.com` | `adm@1234`    | ADMINISTRADOR |
| `equipe@gestor.com`   | `equipe@1234` | EQUIPE        |

(O usuário antigo `proprietario@gestor.com` não existe mais — era o seed que causava a confusão de `role="PROPRIETARIO"`.)

---

## 3. Autenticação

Todas as rotas de negócio exigem header `Authorization: Bearer <token>`, exceto login e redefinir-senha.

### `POST /api/auth/login`

```json
// request
{ "email": "admgestor@gmail.com", "senha": "adm@1234" }

// response 200
{
  "id": 1,
  "nome": "Administrador",
  "email": "admgestor@gmail.com",
  "cargo": "ADMINISTRADOR",
  "telefone": "(00) 00000-0000",
  "ativo": true,
  "token": "eyJhbGciOi..."
}
```

### `GET /api/auth/me` (autenticado)

```json
{
  "id": 1,
  "nome": "Administrador",
  "email": "admgestor@gmail.com",
  "cargo": "ADMINISTRADOR"
}
```

### `POST /api/auth/redefinir-senha` (público)

```json
// request
{ "email": "equipe@gestor.com", "novaSenha": "novaSenha123" }
// response 200: { "message": "Senha redefinida com sucesso." }
// response 404 se email não existir: { "message": "Nenhuma conta encontrada com este e-mail." }
```

⚠️ Não há verificação de posse do e-mail (sem token/link) — troca a senha direto por quem sabe o e-mail. Fica como está por enquanto, mas não é seguro para produção; sinalizar se for pro TCC.

### `POST /api/auth/logout`

Stateless (JWT) — não há nada pra invalidar no servidor. Retorna `204`. O front só precisa descartar o token localmente.

---

## 4. Funcionários — `/api/funcionarios` (🔒 ADMINISTRADOR apenas)

| Método | Rota                     | Body                    | Retorno                          |
| ------ | ------------------------ | ----------------------- | -------------------------------- |
| GET    | `/api/funcionarios`      | —                       | `FuncionarioResponseDTO[]`       |
| GET    | `/api/funcionarios/{id}` | —                       | `FuncionarioResponseDTO`         |
| POST   | `/api/funcionarios`      | `FuncionarioRequestDTO` | `201` + `FuncionarioResponseDTO` |
| PUT    | `/api/funcionarios/{id}` | `FuncionarioUpdateDTO`  | `FuncionarioResponseDTO`         |
| DELETE | `/api/funcionarios/{id}` | —                       | `204`                            |

```ts
// FuncionarioRequestDTO (POST — todos obrigatórios)
{ nome: string(3-100), email: string, senha: string(min 6), cargo: "ADMINISTRADOR"|"EQUIPE", telefone: string }

// FuncionarioUpdateDTO (PUT — todos opcionais, envia só o que mudou)
{ nome?, email?, senha?, cargo?, telefone?, ativo?: boolean }

// FuncionarioResponseDTO
{ id: number, nome, email, cargo: "ADMINISTRADOR"|"EQUIPE", telefone, ativo: boolean }
```

Erros: `409` e-mail já cadastrado, `404` id inexistente.

---

## 5. Obras — `/api/obras`

| Método | Rota                        | Body             | Retorno                   |
| ------ | --------------------------- | ---------------- | ------------------------- |
| GET    | `/api/obras?status=&busca=` | —                | `ObraResponseDTO[]`       |
| GET    | `/api/obras/{id}`           | —                | `ObraResponseDTO`         |
| POST   | `/api/obras`                | `ObraRequestDTO` | `201` + `ObraResponseDTO` |
| PUT    | `/api/obras/{id}`           | `ObraRequestDTO` | `ObraResponseDTO`         |
| PATCH  | `/api/obras/{id}/status`    | `{ novoStatus }` | `ObraResponseDTO`         |
| DELETE | `/api/obras/{id}`           | —                | `204`                     |

```ts
// StatusObra: "EM_ANDAMENTO" | "PAUSADA" | "CONCLUIDA" | "CANCELADA"

// ObraRequestDTO
{ nome: string(3-150), endereco, cliente, dataInicio: "YYYY-MM-DD", prazoConclusao: "YYYY-MM-DD", status?: StatusObra }

// ObraResponseDTO
{ id: uuid, usuarioId: number, nome, endereco, cliente, dataInicio, prazoConclusao, status: StatusObra, criadoEm: datetime }
```

Regras de negócio (inalteradas, só reforçando pro front tratar os erros):

- Não dá pra criar obra já com status `CANCELADA` (`400`).
- Obra em estado terminal (`CONCLUIDA`/`CANCELADA`) não pode ser editada via PUT (`409`).
- Transições de status válidas: `EM_ANDAMENTO ↔ PAUSADA`, e de qualquer um desses dois para `CONCLUIDA` ou `CANCELADA`. Transição inválida = `409`.
- **Novo**: só é possível mudar o status para `CONCLUIDA` se todas as etapas do cronograma da obra estiverem com status `CONCLUIDA` (obras sem nenhuma etapa cadastrada continuam livres para concluir). Se tentar concluir com etapas pendentes, vem `409` (`TransicaoStatusInvalidaException`).
- `busca` filtra por nome ou cliente (case-insensitive, substring).

---

## 6. Cronograma — `/api/obras/{obraId}/cronograma` (🆕 módulo novo)

Aninhado em obra — sempre precisa do `obraId` na URL. Implementa o caso de uso `GerenciarCronograma`.

| Método | Rota                                                        | Body                    | Retorno                                            |
| ------ | ----------------------------------------------------------- | ----------------------- | -------------------------------------------------- |
| GET    | `/api/obras/{obraId}/cronograma`                            | —                       | `CronogramaResponseDTO` (etapas + progresso geral) |
| GET    | `/api/obras/{obraId}/cronograma/etapas/{etapaId}`           | —                       | `EtapaResponseDTO`                                 |
| POST   | `/api/obras/{obraId}/cronograma/etapas`                     | `EtapaRequestDTO`       | `201` + `EtapaResponseDTO`                         |
| PUT    | `/api/obras/{obraId}/cronograma/etapas/{etapaId}`           | `EtapaUpdateDTO`        | `EtapaResponseDTO`                                 |
| PATCH  | `/api/obras/{obraId}/cronograma/etapas/{etapaId}/progresso` | `AtualizarProgressoDTO` | `EtapaResponseDTO`                                 |
| DELETE | `/api/obras/{obraId}/cronograma/etapas/{etapaId}`           | —                       | `204`                                              |

```ts
// StatusEtapa: "NAO_INICIADA" | "EM_ANDAMENTO" | "CONCLUIDA" | "ATRASADA"

// EtapaRequestDTO (criar etapa)
{ nome: string(3-150), descricao?: string, dataPrevistaInicio: "YYYY-MM-DD", dataPrevistaFim: "YYYY-MM-DD", status?: StatusEtapa }
// dataPrevistaFim precisa ser >= dataPrevistaInicio (400 se não for). status default = NAO_INICIADA.

// EtapaUpdateDTO (editar etapa — nome/descrição/datas previstas)
{ nome?, descricao?, dataPrevistaInicio?, dataPrevistaFim? }

// AtualizarProgressoDTO (fluxo "atualizar progresso da etapa")
{ dataRealInicio?: "YYYY-MM-DD", dataRealFim?: "YYYY-MM-DD", percentualProgresso?: number(0-100), status?: StatusEtapa }

// EtapaResponseDTO
{
  id: uuid, obraId: uuid, nome, descricao,
  dataPrevistaInicio, dataPrevistaFim, dataRealInicio, dataRealFim,
  percentualProgresso: number, status: StatusEtapa, criadoEm: datetime
}

// CronogramaResponseDTO (tela "visualizar cronograma")
{ obraId: uuid, progressoGeral: number /* 0-100, média simples das etapas, 0 se não houver etapas */, etapas: EtapaResponseDTO[] }
```

Erros específicos: `404` se a obra ou a etapa não existir; `400` (`EtapaNaoPertenceObraException`) se você chamar uma rota com `obraId`/`etapaId` que não combinam (etapa existe mas é de outra obra).

---

## 7. Fornecedores — `/api/fornecedores`

CRUD já existia; o que é **novo** é o vínculo fornecedor↔obra (fluxo "vincular fornecedor a uma obra" / histórico do caso de uso).

| Método    | Rota                                    | Body                   | Retorno                                      |
| --------- | --------------------------------------- | ---------------------- | -------------------------------------------- |
| GET       | `/api/fornecedores`                     | —                      | `FornecedorResponseDTO[]`                    |
| GET       | `/api/fornecedores/{id}`                | —                      | `FornecedorResponseDTO`                      |
| POST      | `/api/fornecedores`                     | `FornecedorRequestDTO` | `201` + `FornecedorResponseDTO`              |
| PUT       | `/api/fornecedores/{id}`                | `FornecedorUpdateDTO`  | `FornecedorResponseDTO`                      |
| DELETE    | `/api/fornecedores/{id}`                | —                      | `204`                                        |
| 🆕 POST   | `/api/fornecedores/{id}/obras/{obraId}` | —                      | `200` + `FornecedorResponseDTO` (vincula)    |
| 🆕 DELETE | `/api/fornecedores/{id}/obras/{obraId}` | —                      | `200` + `FornecedorResponseDTO` (desvincula) |

```ts
// FornecedorRequestDTO
{ nome: string(3-150), tipoServico: string, telefone: string, email: string, endereco: string }

// FornecedorUpdateDTO
{ nome?, tipoServico?, telefone?, email?, endereco?, ativo?: boolean }

// FornecedorResponseDTO
{
  id: uuid, nome, tipoServico, telefone, email, endereco, criadoEm: datetime, ativo: boolean,
  obrasVinculadas: { id: uuid, nome: string }[]   // 🆕 lista de obras — dá pra tirar a contagem com .length
}
```

Uso típico na tela: listagem mostra `tipoServico`, `telefone`, `email` e `obrasVinculadas.length` (quantidade de obras vinculadas, do caso de uso); no modal de detalhe, mostra a lista `obrasVinculadas` como histórico e um botão "vincular a obra" que dispara o POST acima com uma obra escolhida numa lista (`GET /api/obras`).

Erros: `409` e-mail já cadastrado; `404` fornecedor ou obra inexistente.

---

## 8. Custos — `/api/obras/{obraId}/custos` (🔒 ADMINISTRADOR apenas — implementa `GerenciarCustos`)

Aninhado em obra, igual Cronograma. Substitui a antiga rota plana `/api/custos` (removida).

| Método | Rota                                                 | Body                      | Retorno                      |
| ------ | ----------------------------------------------------- | -------------------------- | ------------------------------ |
| GET    | `/api/obras/{obraId}/custos?categoria=&status=&busca=` | —                          | `CustoResponseDTO[]`          |
| GET    | `/api/obras/{obraId}/custos/{id}`                     | —                          | `CustoResponseDTO`            |
| POST   | `/api/obras/{obraId}/custos`                          | `CustoRequestDTO`          | `201` + `CustoResponseDTO`    |
| PUT    | `/api/obras/{obraId}/custos/{id}`                     | `CustoUpdateDTO`           | `CustoResponseDTO`            |
| PATCH  | `/api/obras/{obraId}/custos/{id}/status`              | `{ "status": "PAGO" }`     | `CustoResponseDTO`            |
| DELETE | `/api/obras/{obraId}/custos/{id}`                     | —                          | `204`                          |
| GET    | `/api/obras/{obraId}/custos/por-categoria`            | —                          | `[{ categoria, total, quantidade, percentualOrcamento }]` |

```ts
// CategoriaCusto: "MATERIAL" | "MAO_DE_OBRA" | "SERVICO_TERCEIRIZADO"
// StatusCusto: "PENDENTE" | "PAGO" | "CANCELADO"

// CustoRequestDTO (POST — status default PENDENTE se omitido; criar já com CANCELADO dá 400)
{ categoria: CategoriaCusto, valor: number(>=0.01), data: "YYYY-MM-DD", descricao: string, fornecedorId?: uuid, status?: "PENDENTE"|"PAGO" }

// CustoUpdateDTO (PUT — substitui o lançamento inteiro; categoria/valor/data/descricao obrigatórios.
// IGNORA o campo `status` caso venha no body — status só muda pelo PATCH abaixo.
// fornecedorId: null remove o fornecedor do lançamento.)
{ categoria: CategoriaCusto, valor: number(>=0.01), data: "YYYY-MM-DD", descricao: string, fornecedorId: uuid | null }

// PATCH /status — únicas transições permitidas: PENDENTE -> PAGO, PENDENTE -> CANCELADO. Qualquer outra dá 400.
{ status: "PAGO" | "CANCELADO" }

// CustoResponseDTO
{ id: uuid, obraId: uuid, categoria: CategoriaCusto, valor: number, data, descricao, status: StatusCusto, fornecedorId: uuid | null, fornecedorNome: string | null, criadoEm: datetime }
```

Se o fornecedor de um lançamento for excluído (`DELETE /api/fornecedores/{id}`), o lançamento continua existindo e `fornecedorId`/`fornecedorNome` passam a `null`.

Erros: `400` dados inválidos ou transição de status inválida; `404` obra/custo/fornecedor inexistente.

---

## 9. Financeiro — `/api/obras/{obraId}/financeiro` + `/api/obras/{obraId}/orcamento` (🔒 ADMINISTRADOR apenas — implementa `DashboardFinanceiro`)

Dados reais, agregados a partir dos custos da obra. Substitui o antigo stub `/api/financeiro/**` (removido).

| Método | Rota                                   | Body                         | Retorno                 |
| ------ | ---------------------------------------- | ----------------------------- | -------------------------- |
| GET    | `/api/obras/{obraId}/financeiro`        | —                              | ver `FinanceiroDashboardDTO` abaixo |
| PUT    | `/api/obras/{obraId}/orcamento`         | `{ "valor": 150000.00 }`      | dashboard recalculado      |

```ts
// SituacaoFinanceira: "SEM_ORCAMENTO" | "DENTRO_DO_ORCAMENTO" | "EM_ALERTA" | "ORCAMENTO_EXCEDIDO"

// FinanceiroDashboardDTO
{
  obraId: uuid, obraNome: string,
  orcamento: number | null,
  totalGasto: number,
  saldoRestante: number | null,       // null quando a obra não tem orçamento definido
  percentualConsumido: number | null, // idem
  situacao: SituacaoFinanceira,
  gastosPorCategoria: [{ categoria: CategoriaCusto, total: number, quantidade: number, percentualOrcamento: number | null }]
}
```

Erros: `400` orçamento ≤ 0; `404` obra inexistente.

---

## 10. Ainda não implementado no backend

- `Emitir Relatórios` / `/api/relatorios/**` — rota reservada na configuração de segurança mas sem controller nenhum ainda (vai dar 404, não 403).

Se o frontend precisar dessa tela antes do backend, é melhor avisar para priorizarmos, em vez de assumir um contrato que ainda pode mudar.

- Você vai fazer **ajustes pequenos no front-end** do **Gestor de Obras** (React + Vite + Tailwind, repositório `gestor-obras-app`), para alinhar as telas **Custos** e **Financeiro** ao back-end que acabou de ser finalizado. **Não mexa no back-end.** **Não faça commit nem push.**

As telas já existem (`src/components/custos/`, `src/components/financeiro/`, `src/services/custosService.js`, `src/services/financeiroService.js`) e as rotas da API já batem. Só os pontos abaixo divergem.

---

## 1. Modal de lançamento: status não muda pela edição

No back-end, `PUT /api/obras/{obraId}/custos/{id}` **ignora o campo `status`**. O status só muda por `PATCH /api/obras/{obraId}/custos/{id}/status`, e só são permitidas as transições:

- `PENDENTE → PAGO` (Registrar pagamento)
- `PENDENTE → CANCELADO` (Cancelar lançamento)

Qualquer outra transição responde **400**.

Hoje o `LancamentoFormModal.jsx` mostra o select de status no modo edição (com `CANCELADO` incluído) e manda `status` no PUT. O usuário muda o status, salva, e nada acontece.

**Ajuste:**

- No modo edição, **esconda o select de status** (ou mostre o status atual só como texto/badge, sem edição).
- Na criação, mantenha o select com `Pendente` e `Pago`.
- No modo edição, não envie `status` no body do PUT.
- As ações "Registrar pagamento" e "Cancelar lançamento" do modal de detalhes já usam o PATCH. Mantenha como está.

## 2. Edição envia o lançamento completo

O PUT substitui todos os dados do lançamento: `categoria`, `valor`, `data` e `descricao` são obrigatórios. `fornecedorId: null` **remove** o fornecedor do lançamento. O modal já envia todos esses campos, então confira apenas que, ao limpar o fornecedor no select, vai `null` (e não string vazia).

## 3. Perfil EQUIPE recebe 403

`/api/obras/{id}/custos/**`, `/api/obras/{id}/financeiro` e `/api/obras/{id}/orcamento` agora são **exclusivos de ADMINISTRADOR**. O perfil EQUIPE recebe **403**.

- Se o menu (`Navbar.jsx`) já esconde itens por perfil, esconda **Custos** e **Financeiro** para `EQUIPE`.
- Se alguém da EQUIPE cair na rota pela URL, a tela deve mostrar a mensagem de erro da API do mesmo jeito que as outras telas mostram, sem quebrar.

## 4. Mensagens de erro da API

O front já usa `err.response.data.message`. As mensagens que podem aparecer:

| Situação                                 | Status | `message`                                                      |
| ---------------------------------------- | ------ | -------------------------------------------------------------- |
| Valor ≤ 0, ou criar com status CANCELADO | 400    | `Dados do lançamento inválidos`                                |
| Transição de status inválida             | 400    | `Transição de status inválida: PAGO -> CANCELADO`              |
| Orçamento ≤ 0                            | 400    | `Orçamento deve ser maior que zero`                            |
| Obra, custo ou fornecedor inexistente    | 404    | `Obra não encontrada com id: ...` (idem para custo/fornecedor) |
| Campo obrigatório faltando               | 400    | `Erro de validação` + objeto `campos`                          |

Nada a mudar se a tela já exibe `message`. Só confira que os textos aparecem bem.

## 5. Fornecedor excluído

Quando um fornecedor é excluído, os lançamentos dele **continuam existindo**, mas ficam sem fornecedor (`fornecedorId` e `fornecedorNome` passam a `null`). A tabela deve mostrar "—" nesse caso.

## 6. Atualizar o HANDOFF_FRONTEND.md

O `HANDOFF_FRONTEND.md` (raiz do `gestor-obras-app`) está desatualizado:

- A seção **8. Custos** ainda descreve `/api/custos` (rota antiga, removida). Troque pela tabela de rotas aninhadas em `/api/obras/{obraId}/custos` (as do `2_Custos_Front.md`), com o `PATCH /status` e o `GET /por-categoria`.
- A seção **9. Financeiro** descreve o stub `/api/financeiro/dashboard` e `/api/financeiro/entrada`, que **foram removidos**. Troque por `GET /api/obras/{obraId}/financeiro` e `PUT /api/obras/{obraId}/orcamento` (as do `4_Financeiro_Front.md`).
- Na tabela de permissões, `custos` e `financeiro` passam a ser só ADMINISTRADOR.

---

## Verificação

- `npm run build` (e lint, se existir) passando.
- Teste manual com o back rodando:
  1. Editar um lançamento: o status não aparece como editável, e o PUT funciona.
  2. Registrar pagamento e cancelar pelo modal de detalhes.
  3. Logar como `equipe@gestor.com` / `equipe@1234` e confirmar que Custos e Financeiro não aparecem no menu (ou mostram o erro de permissão).

## Resumo final que eu preciso

1. Arquivos alterados.
2. Qualquer ponto em que precisou adaptar este pedido ao código existente.
