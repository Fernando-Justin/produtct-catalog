# System Design Review (SDR) - ProductSQUAD Manager

## 1. Arquitetura e Stack

O sistema utiliza uma estrutura de **Monorepo** gerenciada pelo **Turborepo**, garantindo _end-to-end type safety_ e compartilhamento de configurações entre `apps/web` e `apps/api`.

### 1.1 Tecnologias Core

- **Frontend**: React 18 (Vite) + Tailwind CSS.
- **Backend**: Node.js + Express + Prisma ORM.
- **Banco de Dados**: PostgreSQL (Supabase).
- **Autenticação**: JWT (JSON Web Tokens) com suporte a _Dev Login_ e integração futura Google OAuth.

## 2. Padrões de Design Técnico

### 2.1 Fluxo de Dados e Estado

- **API**: Estrutura desacoplada em Roteamento -> Controllers -> Prisma Client.
- **Web**: Comunicação via `axios`. Gerenciamento de estado via `React Context` para dados globais e Hooks para lógica de componentes.

### 2.2 Engenharia do Gráfico de Gantt (Gestão à Vista)

Para atender ao [REQ-06], o componente foi desenhado para visualização anual:

- **Auto-focus**: Posicionamento automático no dia atual via `useEffect` e `scrollIntoView`.
- **Sticky Assignee**: Lógica de cálculo de `offset` dinâmico para manter a identificação do responsável visível mesmo durante o scroll horizontal da barra de atividade.

## 3. Segurança e Permissões (RBAC)

O sistema implementa o controle de acesso baseado em funções (Role-Based Access Control) validado via middleware no backend:

- **ADMIN / TECH_LEAD**: Acesso total para gestão de squads, usuários e catálogos.
- **USER / GUEST**: Permissões de leitura e interação limitadas conforme a squad de alocação.

## 4. Estratégia de Importação e Idempotência

O módulo de importação CSV [REQ-08] utiliza uma lógica de **Upsert**:

- **Match de ID**: Se o ID existe no CSV e no banco, executa `UPDATE`.
- **Novo Registro**: Caso contrário, executa `CREATE`.
  Esta abordagem evita a duplicação de dados em cargas massivas recorrentes.

## 5. Conformidade SDD (Spec-Driven Development)

- **Rastreabilidade**: Toda implementação deve ser mapeada para um requisito do `PRD.md`.
- **Integridade**: Garantia de sincronia entre o Schema Prisma e as interfaces TypeScript no Frontend.
- **Qualidade**: Linting e Type Checking obrigatórios no workflow de desenvolvimento.
