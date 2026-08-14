# Caso de Uso: GerenciarFuncionarios

**Ator**: Administrador

**Breve descrição**: cadastro, visualização, edição e inativação de funcionários relacionados às obras dentro do sistema Gestor de Obras.

## Condições prévias
Usuário estar logado no sistema.

## Fluxo básico — Cadastrar funcionário
1. Administrador seleciona "cadastrar funcionário".
2. Informa os dados do funcionário.
3. Seleciona o tipo de funcionário (podendo ser administrador).
4. Confirma o cadastro.
5. Sistema salva o novo funcionário.

## Fluxos alternativos

### Editar funcionário
1. Administrador entra na área de gerenciar funcionários.
2. Localiza o funcionário na tabela (filtro ou busca).
3. Abre modal com dados do funcionário, altera o que for necessário.
4. Salva alterações.

### Visualizar funcionário
1. Administrador entra na área de gerenciar funcionários.
2. Localiza o funcionário na tabela (filtro ou busca).
3. Clica no funcionário.
4. Modal abre com informações e opções de controle.

### Deletar (inativar) funcionário
1. Administrador entra na área de gerenciar funcionários.
2. Seleciona o funcionário na tabela.
3. No modal, aciona a opção de inativar.
4. Modal de confirmação é exibido.

## Cenários chave
Cadastrar funcionário com permissões definidas; editar dados de funcionário existente; inativar funcionário.

## Condições posteriores
Funcionário cadastrado/editado/inativado, acessível a partir de conta com status administrador.

## Pontos de extensão / requisitos especiais
Não se aplica.

---
Fonte original: [`../../originais/casos-de-uso/Espec_UseCase_GerenciarFunc.docx.pdf`](../../originais/casos-de-uso/Espec_UseCase_GerenciarFunc.docx.pdf)

> Nota: a seção "Breve Descrição" do documento original estava copiada por engano do caso de uso GerenciarObras (falava de "obras" e "dashboard de status"). O texto acima foi corrigido para refletir o conteúdo real do documento (gestão de funcionários) — vale avisar quem revisar o TCC para corrigir o PDF original.
