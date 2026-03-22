# System Design Review (SDR) - ProductSQUAD Manager

## 1. Decisões de Design (Arquitetura)
O sistema foi projetado como um **Monorepo** utilizando **Turborepo** para gerenciar as aplicações `web` (Frontend) e `api` (Backend) em um único repositório, garantindo consistência de tipos e compartilhamento de configurações.

### 1.1 Stack Tecnológica
- **Frontend**: React (Vite) + Tailwind CSS + Lucide React (Ícones).
- **Backend**: Node.js + Express + Prisma ORM.
- **Banco de Dados**: PostgreSQL (hospedado no Supabase).
- **Autenticação**: JWT (JSON Web Tokens) + Estratégia Dev Login + Integração futura com Google OAuth via Passport.js.
- **Linguagem**: TypeScript (End-to-end type safety).

## 2. Padrões de Implementação

### 2.1 Fluxo de Dados (Data Flow)
1. **Frontend**: Utiliza `axios` para requisições e `React Context/Hooks` para gerenciamento de estado simples (ou TanStack Query para dados dinâmicos).
2. **API**: Camadas de Roteamento -> Controllers -> Prisma (Database).
3. **Database**: Migrations gerenciadas pelo Prisma, garantindo versionamento do schema.

### 2.2 Gestão Visual (Gantt & Kanban)
- **Gantt Chart**: Implementado com componentes customizados para alto desempenho e interatividade.
- **Scroll Automático**: Lógica de `useEffect` com `refs` para posicionar o usuário no dia atual.
- **Alinhamento do Responsável**: Cálculo de `offset` dinâmico dentro da barra da atividade para fixar o nome do responsável na data atual (Sticky Info).

## 3. Segurança & Permissões
- O backend valida o JWT em cada requisição protegida.
- O middleware `checkRole` deve interceptar as rotas para garantir que apenas `ADMIN` ou `TECH_LEAD` possam editar configurações críticas de squads e roles.

## 4. Estratégia de Importação (Deduplicação)
- O módulo de importação CSV utiliza um campo `ID` (opcional no arquivo) para identificar itens existentes.
- Se o ID estiver presente no CSV e no Banco, o sistema realiza um `UPDATE`. Se não, realiza um `CREATE`. Isso evita duplicidades ao re-importar planilhas atualizadas.

## 5. Auditoria Técnica (Spec Compliance)
- **SDD Compliance**: O código segue as especificações do `PRD.md` rigorosamente.
- **Linting**: Padrões de código garantidos via ESLint e Prettier (configurados no root).
- **Type Checking**: `tsc` executado no pipeline (ou localmente) para evitar erros de tempo de execução.
