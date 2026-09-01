# Handoff para o Claude do frontend (`gestor-obras-app`)

Este documento descreve o estado atual da API do `gestor-obras-api` depois de três mudanças: implementação do módulo **Cronograma**, conclusão do módulo **Fornecedores** (vínculo com obras) e um **refactor de permissões** que estava quebrado. Leia a seção "Breaking change" antes de mexer em qualquer tela de login/permissão.

Base URL local: `http://localhost:8080`. CORS liberado para qualquer origem com credenciais.

---

## 1. Breaking change: `role` foi removido, use `cargo`

O `Funcionario` tinha dois campos de nível de acesso desencontrados: `cargo` (enum `ADMINISTRADOR`/`EQUIPE`, usado em vários lugares) e `role` (string livre, usada só para montar a autoridade do Spring Security, e que por bug ficava sempre `"EQUIPE"` mesmo para o admin — por isso as permissões não faziam efeito nenhum antes).

**O que mudou:** `role` foi removido de todo o contrato de API. `cargo` (`"ADMINISTRADOR"` ou `"EQUIPE"`) é agora a única fonte de verdade de permissão, tanto no banco quanto nas respostas.

Campos afetados:

| Onde | Antes | Agora |
|---|---|---|
| `POST /api/auth/login` (resposta) | `role: string` | `cargo: "ADMINISTRADOR" \| "EQUIPE"` |
| `GET /api/auth/me` (resposta) | `role` no JSON | `cargo` no JSON |
| `Funcionario` (request/response do CRUD) | `role` opcional | campo removido — só existe `cargo` |

Se o frontend usa `role` para decidir o que renderizar (esconder menu de funcionários, etc.), troque para `cargo === "ADMINISTRADOR"`.

---

## 2. Modelo de permissões

Dois papéis apenas: `ADMINISTRADOR` e `EQUIPE` (enum `TipoCargo`). Nada de `PROPRIETARIO` — esse valor existia antes só no campo `role` legado e nunca teve efeito real.

| Módulo | ADMINISTRADOR | EQUIPE |
|---|---|---|
| `/api/funcionarios/**` | ✅ tudo | ❌ 403 Forbidden |
| `/api/obras/**` (inclui cronograma aninhado) | ✅ | ✅ |
| `/api/custos/**` | ✅ | ✅ |
| `/api/fornecedores/**` | ✅ | ✅ |
| `/api/financeiro/**` | ✅ | ✅ |
| `/api/relatorios/**` (ainda não implementado no backend) | ✅ | ✅ |
| `/api/auth/me` | qualquer autenticado | qualquer autenticado |

Ou seja: só a gestão de funcionários (criar/editar/inativar colegas) é admin-only. Todo o resto do dia a dia (obras, cronograma, fornecedores, custos, financeiro) é liberado para EQUIPE também — não há mais telas "cinza" para usuário comum além dessa.

Isso significa: no frontend, esconda/desabilite as rotas e botões de "Gerenciar Funcionários" quando `cargo !== "ADMINISTRADOR"`, mas pode manter o resto do app igual para os dois papéis.

### Erros de autenticação/autorização

Antes voltava a página de erro padrão (não-JSON) do Spring. Agora sempre vem JSON:

```json
// 401 — sem token ou token inválido
{ "timestamp": "...", "status": 401, "error": "Unauthorized", "message": "Autenticação necessária", "path": "/api/funcionarios" }

// 403 — autenticado, mas sem permissão (ex: EQUIPE tentando acessar /api/funcionarios)
{ "timestamp": "...", "status": 403, "error": "Forbidden", "message": "Acesso negado: permissão insuficiente para este recurso", "path": "/api/funcionarios" }
```

### Credenciais de teste (seed local, `DataInitializer`)

| Email | Senha | Cargo |
|---|---|---|
| `admgestor@gmail.com` | `adm@1234` | ADMINISTRADOR |
| `equipe@gestor.com` | `equipe@1234` | EQUIPE |

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
{ "id": 1, "nome": "Administrador", "email": "admgestor@gmail.com", "cargo": "ADMINISTRADOR" }
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

| Método | Rota | Body | Retorno |
|---|---|---|---|
| GET | `/api/funcionarios` | — | `FuncionarioResponseDTO[]` |
| GET | `/api/funcionarios/{id}` | — | `FuncionarioResponseDTO` |
| POST | `/api/funcionarios` | `FuncionarioRequestDTO` | `201` + `FuncionarioResponseDTO` |
| PUT | `/api/funcionarios/{id}` | `FuncionarioUpdateDTO` | `FuncionarioResponseDTO` |
| DELETE | `/api/funcionarios/{id}` | — | `204` |

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

| Método | Rota | Body | Retorno |
|---|---|---|---|
| GET | `/api/obras?status=&busca=` | — | `ObraResponseDTO[]` |
| GET | `/api/obras/{id}` | — | `ObraResponseDTO` |
| POST | `/api/obras` | `ObraRequestDTO` | `201` + `ObraResponseDTO` |
| PUT | `/api/obras/{id}` | `ObraRequestDTO` | `ObraResponseDTO` |
| PATCH | `/api/obras/{id}/status` | `{ novoStatus }` | `ObraResponseDTO` |
| DELETE | `/api/obras/{id}` | — | `204` |

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

| Método | Rota | Body | Retorno |
|---|---|---|---|
| GET | `/api/obras/{obraId}/cronograma` | — | `CronogramaResponseDTO` (etapas + progresso geral) |
| GET | `/api/obras/{obraId}/cronograma/etapas/{etapaId}` | — | `EtapaResponseDTO` |
| POST | `/api/obras/{obraId}/cronograma/etapas` | `EtapaRequestDTO` | `201` + `EtapaResponseDTO` |
| PUT | `/api/obras/{obraId}/cronograma/etapas/{etapaId}` | `EtapaUpdateDTO` | `EtapaResponseDTO` |
| PATCH | `/api/obras/{obraId}/cronograma/etapas/{etapaId}/progresso` | `AtualizarProgressoDTO` | `EtapaResponseDTO` |
| DELETE | `/api/obras/{obraId}/cronograma/etapas/{etapaId}` | — | `204` |

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

| Método | Rota | Body | Retorno |
|---|---|---|---|
| GET | `/api/fornecedores` | — | `FornecedorResponseDTO[]` |
| GET | `/api/fornecedores/{id}` | — | `FornecedorResponseDTO` |
| POST | `/api/fornecedores` | `FornecedorRequestDTO` | `201` + `FornecedorResponseDTO` |
| PUT | `/api/fornecedores/{id}` | `FornecedorUpdateDTO` | `FornecedorResponseDTO` |
| DELETE | `/api/fornecedores/{id}` | — | `204` |
| 🆕 POST | `/api/fornecedores/{id}/obras/{obraId}` | — | `200` + `FornecedorResponseDTO` (vincula) |
| 🆕 DELETE | `/api/fornecedores/{id}/obras/{obraId}` | — | `200` + `FornecedorResponseDTO` (desvincula) |

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

## 8. Custos — `/api/custos` (já existia, sem mudanças de contrato)

| Método | Rota | Body | Retorno |
|---|---|---|---|
| GET | `/api/custos?obraId=` (opcional) | — | `CustoResponseDTO[]` |
| GET | `/api/custos/{id}` | — | `CustoResponseDTO` |
| POST | `/api/custos` | `CustoRequestDTO` | `201` + `CustoResponseDTO` |
| PUT | `/api/custos/{id}` | `CustoUpdateDTO` | `CustoResponseDTO` |
| DELETE | `/api/custos/{id}` | — | `204` |

```ts
// CategoriaCusto: "MATERIAL" | "MAO_DE_OBRA" | "SERVICO_TERCEIRIZADO"

// CustoRequestDTO
{ obraId: uuid, categoria: CategoriaCusto, valor: number(>=0.01), data: "YYYY-MM-DD", descricao?: string }

// CustoResponseDTO
{ id: uuid, obraId: uuid, categoria: CategoriaCusto, valor: number, data, descricao, criadoEm: datetime }
```

---

## 9. Financeiro — `/api/financeiro` (⚠️ ainda é stub, não trate como fonte de dados real)

```
GET  /api/financeiro/dashboard  -> 200 { "status": "ok", "mensagem": "Dashboard financeiro acessível" }
POST /api/financeiro/entrada    -> 200 { "status": "ok", "mensagem": "Entrada financeira criada" }
```
Não faz nada de verdade ainda (não lê/grava nada), só valida que o endpoint responde e que a permissão está correta. Dá pra integrar a tela apontando pra cá, mas os dados reais de dashboard financeiro (orçado x gasto, por obra) precisam vir agregando `GET /api/custos?obraId=` por enquanto — não existe endpoint agregador ainda.

---

## 10. Ainda não implementado no backend

- `GerenciarCustos` como caso de uso próprio (hoje é só CRUD simples de `Custo`, sem a visão de "orçamento x gasto" do proprietário).
- `DashboardFinanceiro` de verdade (o controller é stub, ver seção 9).
- `Emitir Relatórios` / `/api/relatorios/**` — rota reservada na configuração de segurança mas sem controller nenhum ainda (vai dar 404, não 403).

Se o frontend precisar dessas telas antes do backend, é melhor avisar para priorizarmos, em vez de assumir um contrato que ainda pode mudar.
