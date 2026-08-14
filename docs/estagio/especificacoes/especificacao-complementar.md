# Especificação Complementar (Requisitos Não Funcionais) — Gestor de Obras

Requisitos que não são capturados nos casos de uso: qualidade, restrições de design, interfaces, licenciamento e padrões aplicáveis.

## Funcionalidade
Cadastro, edição e exclusão de obras (nome, endereço, cliente responsável, data de início, prazo previsto, status: em andamento / concluída / pausada). Dashboard com listagem de obras ativas, filtro por status e busca por nome/cliente.

## Utilidade
Interface web responsiva (desktop e mobile). Usuário com conhecimento básico de informática deve conseguir usar as funcionalidades principais sem treinamento, em até 30 minutos de adaptação. Navegação clara e autoexplicativa.

## Confiabilidade
Disponibilidade e integridade dos dados — sem perda de dados, sistema deve funcionar de forma consistente durante o horário comercial.

## Desempenho
Tempo de resposta das operações deve ser rápido o suficiente para não impactar o uso cotidiano (ver Documento de Visão: máx. 3s).

## Suportabilidade
- Nomenclaturas: toda a interface em português, padronizada.
- Ajuda online acessível de qualquer tela; manual do usuário em PDF entregue ao final do projeto (cadastro de obras, controle financeiro, relatórios).

## Restrições de design
Interface web responsiva, tecnologias web padrão.

## Componentes comprados
Nenhum. Apenas tecnologias open source, sem custo de licenciamento.

## Interfaces
- **Usuário**: telas de login, dashboard, cadastro/listagem de obras, controle financeiro por obra, cadastro de fornecedores, geração de relatórios. Responsiva.
- **Hardware**: nenhum requisito especial — computadores padrão e dispositivos móveis com navegador atualizado (últimos 2 anos).
- **Software**: sem integração externa prevista na v1; possibilidade futura de importação/exportação CSV.
- **Comunicações**: HTTPS obrigatório, acesso via internet (sem VPN).

## Requisitos de licença
Aviso de uso restrito na tela de login. Acesso não autorizado vedado. Sem licenças pagas de terceiros.

## Padrões aplicáveis
- **LGPD** (Lei 13.709/2018) — tratamento de dados pessoais de clientes e fornecedores
- **WCAG 2.1** — acessibilidade da interface web
- **HTTPS/TLS** — protocolo seguro obrigatório
- **RUP** — processo de desenvolvimento (Rational Unified Process)

---
Fonte original: [`../originais/documentos/Especificacao_Complementar - Davi Rodrigues (1).docx`](../originais/documentos/Especificacao_Complementar%20-%20Davi%20Rodrigues%20(1).docx)
