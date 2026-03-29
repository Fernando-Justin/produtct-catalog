# SDR - Software Design Record
## ProductSQUAD Manager

## 1. Visão Geral

### 1.1 Propósito da Aplicação

O **ProductSQUAD Manager** é uma plataforma centralizada para gestão de catálogos de produtos digitais, roadmaps de delivery e sustentabilidade técnica. O sistema foi projetado para eliminar a fragmentação de informações (planilhas, documentos esparsos, silos de dados) e fornecer uma **"Single Source of Truth"** para times de produto, desenvolvimento e stakeholders.

### 1.2 Público-Alvo

| Perfil | Papel | Necessidades |
|--------|-------|--------------|
| Tech Leads | Liderança técnica | Visualizar stack tecnológica, identificar gargalos, gerenciar alocação de devs |
| Product Owners (PO) | Gestão de produto | Planejar roadmap, importar atividades via CSV, acompanhar进度 |
| Desenvolvedores | Execução | Consultar tecnologias por ambiente, entender ecossistema de produtos |
| Administradores | Operações | Gerenciar usuários, roles e squads |
| Stakeholders | Decisão | Dashboard analítico, visibilidade de progresso |

### 1.3 Objetivos Principais

1. **Catálogo Centralizado**: Cadastro detalhado de produtos, squads, stacks e aplicações subordinadas
2. **Gestão de Sustentação**: Identificar desenvolvedores alocados e responsáveis técnicos por produto
3. **Transparência de Delivery**: Acompanhamento de entregas via Kanban e Gantt com indicadores de conclusão
4. **Integração com Clientes**: Registro de consumidores e sugestões de melhoria
5. **Roadmap Visual**: Gráfico de Gantt anual interativo com foco automático na data atual
6. **Centralização de Infraestrutura**: Links rápidos para monitoramento, logs e orquestração

### 1.4 Contexto de Negócio

O projeto utiliza a metodologia **SDD (Spec-Driven Development)**, onde especificações rigorosas registradas no PRD.md orientam diretamente o desenvolvimento, garantindo rastreabilidade entre requisitos e implementação.

---

## 2. Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUÁRIOS                                        │
│                    (Tech Leads, POs, Devs, Admins)                          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTP/HTTPS
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React 18)                               │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    AppLayout (Sidebar + Topbar)                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │    │
│  │  │ Dashboard   │  │  Products   │  │  Roadmap    │  │  Squads   │  │    │
│  │  │   Page      │  │   Page      │  │   Page      │  │   Page    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │    │
│  │  │   Users     │  │   Roles     │  │  Projects   │  │   About   │  │    │
│  │  │   Page      │  │   Page      │  │   Page      │  │   Page    │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │ AuthContext (JWT State)                      │
└──────────────────────────────┼─────────────────────────────────────────────┘
                               │ Axios + Bearer Token
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (Node.js + Express)                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Routes (/api/*)                               │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │   Auth   │  │ Products │  │ Roadmap  │  │  Squads  │            │    │
│  │  │          │  │          │  │          │  │          │            │    │
│  │  │  Users   │  │ Projects │  │  Roles   │  │ Clients  │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │ Controllers                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Auth Middleware (JWT Verify)                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                              │ Prisma ORM                                   │
└──────────────────────────────┼─────────────────────────────────────────────┘
                               │ SQL
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL - Supabase)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐        │
│  │   Users     │  │  Products   │  │  Roadmap    │  │  Squads   │        │
│  │   Roles     │  │   Apps      │  │  Projects   │  │  Clients  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológico

### 3.1 Frontend (`apps/web`)

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Framework** | React | 18.3.0 |
| **Build Tool** | Vite | 5.3.0 |
| **Linguagem** | TypeScript | 5.4.0 |
| **Roteamento** | React Router DOM | 6.24.0 |
| **Styling** | Tailwind CSS | 3.4.0 |
| **HTTP Client** | Axios | 1.7.0 |
| **UI Primitives** | Radix UI (dialog, select, tabs, dropdown-menu, tooltip) | - |
| **Ícones** | Lucide React | 0.400.0 |
| **Gráficos** | Recharts | 2.12.0 |
| **Processamento Excel** | xlsx | 0.18.5 |
| **Utilidades CSS** | clsx, class-variance-authority, tailwind-merge | - |

### 3.2 Backend (`apps/api`)

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Runtime** | Node.js | 20 |
| **Framework** | Express | 4.19.0 |
| **Linguagem** | TypeScript | 5.4.0 |
| **ORM** | Prisma | 5.15.0 |
| **Banco de Dados** | PostgreSQL | 16 |
| **Autenticação** | JWT (jsonwebtoken) | - |
| **OAuth** | Passport.js + passport-google-oauth20 | - |
| **Segurança** | Helmet, CORS | - |
| **Dev Runner** | tsx | 4.15.0 |

### 3.3 Build System

| Tecnologia | Versão |
|------------|--------|
| Turborepo | 2.0.0 |
| npm | 11.6.2 |

---

## 4. Funcionalidades

### 4.1 Dashboard

**Descrição**: Painel analítico com visão consolidada do ecossistema de produtos.

**Fluxo do Usuário**:
1. Usuário acessa `/dashboard` (página protegida)
2. Sistema carrega estatísticas via `GET /api/dashboard/stats`
3. Dashboard exibe cards e gráficos

**Componentes Visuais**:
- 4 cards de estatísticas (Produtos, Apps, Devs, Clientes)
- Gráfico de Pizza: Distribuição por status (BACKLOG, IN_PROGRESS, BLOCKED, DONE)
- Gráfico de Barras: Atividades por nível de esforço (PP, P, M, G, GG)
- Gráfico de Barras Horizontal: Entregas por Produto
- Gráfico de Barras: Entregas por Usuário
- Cards de deadline: Overdue, Soon (7 dias), Future
- Gráfico de Barras: Tecnologias mais utilizadas

**API**:
```
GET /api/dashboard/stats
Response: {
  totalProducts: number,
  totalApps: number,
  totalDevs: number,
  totalClients: number,
  statusCounts: { status: string; _count: number }[],
  effortCounts: { effort: string; _count: number }[],
  stackCounts: { stack: string; _count: number }[],
  deadlines: { overdue: number; soon: number; future: number },
  roadmapByProduct: { name: string; count: number }[],
  roadmapByUser: { name: string; count: number }[]
}
```

---

### 4.2 Catálogo de Produtos

**Descrição**: Gestão completa do catálogo de produtos com CRUD e relacionamentos.

**Fluxo do Usuário**:
1. Acessar lista em `/products`
2. Pesquisar por nome ou squad
3. Criar novo produto via modal
4. Clicar em card para ver detalhes

**Sub-funcionalidades** (tabs do ProductDetailPage):

| Tab | Funcionalidade |
|-----|----------------|
| **Visão Geral** | Descrição, propósito, observações, links |
| **Stack** | Tecnologias por ambiente (HOMOLOGAÇÃO, PRODUÇÃO) |
| **Aplicações** | Microsserviços e frontends vinculados |
| **Devs** | Desenvolvedores alocados com flag isLead |
| **Clientes** | Aplicações que consomem o produto |
| **Ambiente** | URLs, hosts, credenciais, orquestração |
| **Delivery** | Roadmap de atividades do produto |

**API Endpoints**:
```
GET    /api/products              → Lista todos os produtos
GET    /api/products/:id           → Detalhe do produto (com relações)
POST   /api/products              → Criar produto
PUT    /api/products/:id          → Atualizar produto
DELETE /api/products/:id          → Excluir produto
POST   /api/products/:productId/devs           → Adicionar dev
DELETE /api/products/:productId/devs/:userId   → Remover dev
POST   /api/products/:productId/stacks          → Adicionar stack
DELETE /api/products/:productId/stacks/:id      → Remover stack
PUT    /api/products/:productId/environments/:envName  → Upsert ambiente
PUT    /api/products/:productId/databases/:envName    → Upsert banco
POST   /api/products/:productId/links           → Adicionar link
DELETE /api/products/:productId/links/:id       → Remover link
```

---

### 4.3 Roadmap e Delivery (Gestão à Vista)

**Descrição**: Visualização e gestão de atividades de delivery com múltiplas views.

**Views Disponíveis**:
1. **Kanban**: Colunas por status (BACKLOG, IN_PROGRESS, BLOCKED, HOMOLOGATION, DONE)
2. **Gantt**: Timeline anual com foco automático no dia atual
3. **Lista**: Visualização tabular com ordenação

**Filtros**:
- Produtos (multi-select)
- Projetos (multi-select)
- Usuários/Responsáveis (multi-select)
- Status (multi-select, exceto ARCHIVED por padrão)
- Busca por título/identificador
- Toggle "Mostrar arquivados"

**Ordenação**: PRODUCT (default), PROJECT, DATE, STATUS, TITLE, EVOLUTION

**Importação/Exportação**:
- CSV Export com headers: Product, Project, ID, Title, Assignee, Status, Effort, Planned Date, Completion %, Risk
- CSV Import com deduplicação por ID (Upsert)
- XLSX Import com mapeamento flexível de colunas
- Download de template

**Gráfico de Gantt**:
- Timeline anual completo (Jan 1 a Dez 31)
- Auto-scroll para o dia atual
- Sticky headers de estrutura (Projeto → Produto → Atividade)
- Barras coloridas por responsável
- Indicadores visuais: Done (check), Risk (triângulo pulsante)
- Barra de progresso integrada para % de conclusão
- Linha tracejada do dia atual

**API Endpoints**:
```
GET    /api/roadmap                → Lista todos os itens
POST   /api/roadmap                → Criar item
PUT    /api/roadmap/:id            → Atualizar item
DELETE /api/roadmap/:id            → Excluir item
POST   /api/roadmap/import         → Importar CSV
POST   /api/roadmap/import/xlsx    → Importar XLSX
```

---

### 4.4 Gestão de Squads

**Descrição**: CRUD completo de squads de desenvolvimento.

**Fluxo do Usuário**:
1. Acessar `/squads`
2. Ver lista de squads em cards
3. Criar/editar/excluir squad via modal

**API Endpoints**:
```
GET    /api/squads                → Lista squads
POST   /api/squads                → Criar squad
PUT    /api/squads/:id            → Atualizar squad
DELETE /api/squads/:id            → Excluir squad
```

---

### 4.5 Gestão de Usuários

**Descrição**: CRUD completo de usuários com dados de RH.

**Campos do Formulário**:
- Dados de login: Nome, Email
- Dados RH: ID App RH, Data de Admissão, CPF
- Dados principais: Nome Completo, Email Corporativo, Cargo, Squad, Status
- Endereço: Logradouro, Número, Complemento, Bairro, Cidade, UF, CEP
- Observações

**API Endpoints**:
```
GET    /api/users                 → Lista usuários
POST   /api/users                 → Criar usuário
PUT    /api/users/:id             → Atualizar usuário
DELETE /api/users/:id             → Excluir usuário
```

---

### 4.6 Gestão de Roles

**Descrição**: Controle de roles para RBAC.

**Roles Disponíveis**:
- ADMIN: Permissão total
- PO: Product Owner
- DEV: Desenvolvedor
- SQUAD_LEAD: Líder de squad
- VIEWER: Apenas visualização

**API Endpoints**:
```
GET    /api/roles                 → Lista roles
POST   /api/roles                 → Criar role
PUT    /api/roles/:id             → Atualizar role
DELETE /api/roles/:id             → Excluir role
```

---

### 4.7 Gestão de Projetos

**Descrição**: Agrupamento de atividades de delivery com Product Owner.

**API Endpoints**:
```
GET    /api/projetos              → Lista projetos
GET    /api/projetos/:id          → Detalhe do projeto
POST   /api/projetos              → Criar projeto
PUT    /api/projetos/:id          → Atualizar projeto
DELETE /api/projetos/:id          → Excluir projeto (proteção: não exclui se tiver roadmapItems)
```

---

### 4.8 Autenticação

**Métodos**:
1. **Dev Login** (desenvolvimento): Email + nome
2. **Google OAuth** (produção): Login via Google

**Fluxo Dev Login**:
```
POST /api/auth/dev-login
Body: { name: string, email: string }
Response: { token: string, user: User }
```

**Fluxo Google OAuth**:
```
GET  /api/auth/google → Redireciona para Google
GET  /api/auth/google/callback?code=xxx → Callback OAuth
     → Redireciona para {FRONTEND_URL}/auth/callback?token={jwt}
```

**Validação de Sessão**:
```
GET  /api/auth/me
Headers: Authorization: Bearer {token}
Response: User com role e squad
```

---

## 5. Fluxos de Negócio

### 5.1 Fluxo: Importação de Roadmap via CSV

**Ator**: PO ou Administrador
**Pré-condições**: Usuário autenticado com token válido

**Passos**:
1. Usuário acessa `/delivery`
2. Clica em "Importar CSV"
3. Seleciona arquivo CSV
4. Sistema faz parse do arquivo
5. Para cada linha:
   - Se `id` existe no banco → UPDATE
   - Se `id` não existe → CREATE
6. Sistema exibe toast de sucesso/erro
7. Lista é atualizada automaticamente

**Regras de Negócio**:
- Coluna `identifier` é usada para match
- Se status = 'DONE' e não houver `finishDateAtividade`, auto-set para NOW
- Deduplicação por ID (Upsert)

---

### 5.2 Fluxo: Alocação de Dev a Produto

**Ator**: Administrador ou Tech Lead
**Pré-condições**: Produto e usuário existentes

**Passos**:
1. Usuário acessa detalhe do produto
2. Navega para tab "Devs"
3. Clica "Adicionar Dev"
4. Seleciona usuário da lista
5. Marca flag "É Lead" se aplicável
6. Sistema cria vínculo em ProductDev

---

### 5.3 Fluxo: Atualização de Status Kanban

**Ator**: PO, Dev ou Tech Lead
**Pré-condições**: RoadmapItem existente

**Passos**:
1. Usuário arrasta card na view Kanban
2. Sistema captura novo status
3. PUT /api/roadmap/:id com novo status
4. Se novo status = 'DONE':
   - Se `finishDateAtividade` vazio, setar para NOW
5. UI atualiza card

---

## 6. Estrutura de Dados

### 6.1 Entidades Principais

| Entidade | Descrição | Relacionamentos |
|----------|-----------|-----------------|
| **User** | Usuário do sistema | role, squad, productDevs, roadmapItems, projects (como PO) |
| **Role** | Cargo/função | users |
| **Squad** | Squad de desenvolvimento | users, products |
| **Product** | Produto/aplicação principal | squad, apps, devs, clients, stacks, environments, databases, links, roadmapItems |
| **App** | Aplicação individual | product, stacks, environments, links |
| **Project** | Projeto de delivery | productOwner (User), roadmapItems |
| **RoadmapItem** | Atividade/entrega | product, project, assignee (User) |
| **Client** | Cliente/consumidor | product, suggestions |
| **ClientSuggestion** | Sugestão de cliente | client |

### 6.2 Enums

```prisma
enum RoleType { ADMIN, PO, DEV, SQUAD_LEAD, VIEWER }
enum StackType { JAVA, GO_LANG, PYTHON, REACT, NODEJS, DOTNET, RUST, TYPESCRIPT, PHP, SPRING_BOOT, GIN, FAST_API, NEXT_JS, EXPRESS, NEST_JS, ASP_NET_CORE, LARAVEL, SYMFONY, POSTGRESQL, MYSQL, ORACLE, SQL_SERVER, NOSQL, MONGODB, REDIS, KEYDB, OUTROS }
enum Environment { HOMOLOGACAO, PRODUCAO, AMBOS }
enum ProductStatus { ATIVO, INATIVO, DEPRECIADO, PLANEJADO }
enum ProjectStatus { PLANEJADO, EM_ANDAMENTO, PAUSADO, FINALIZADO }
enum ActivityStatus { BACKLOG, IN_PROGRESS, BLOCKED, HOMOLOGATION, DONE, ARCHIVED }
enum EffortLevel { PP, P, M, G, GG }
```

---

## 7. Segurança

### 7.1 Autenticação

- **JWT (JSON Web Tokens)**: Token enviado via Bearer no header Authorization
- **Dev Login**: Login simplificado para desenvolvimento
- **Google OAuth**: Login via Google (Passport.js)
- **Validação**: Middleware `auth.middleware.ts` verifica token em todas as rotas `/api/*`

### 7.2 Autorização (RBAC)

- **ADMIN**: Acesso total
- **PO**: Acesso a produtos, roadmap, projetos
- **DEV**: Acesso de leitura + interação básica
- **SQUAD_LEAD**: Acesso de liderança técnica
- **VIEWER**: Apenas leitura

### 7.3 Proteção de Dados

- **HTTPS**: Recomendado para produção
- **Helmet**: Headers de segurança (XSS, clickjacking, etc.)
- **CORS**: Configurado com `FRONTEND_URL` whitelisted
- **Validação de Inputs**: Validação server-side em todos os endpoints
- **Prisma Error Handling**: Códigos P2025 (not found), P2002 (unique), P2003 (foreign key)

### 7.4 Prevenção de Ataques

- **XSS**: React escapa por padrão; Helmet adiciona headers
- **SQL Injection**: Prisma ORM parametriza queries
- **CSRF**: Token JWT stateless
- **CORS**: Whitelist de origens

---

## 8. Performance e Escalabilidade

### 8.1 Otimizações Implementadas

| Técnica | Aplicação |
|---------|-----------|
| **React.memo** | Componentes com renderização intensiva (GanttChart) |
| **useMemo** | Cálculos de timeline e agrupamento |
| **useCallback** | Funções de event handler em listas |
| **Lazy Loading** | Rotas carregadas sob demanda via React Router |
| **Axios Interceptors** | Reutilização de configuração e tratamento centralizado de erros |

### 8.2 Limites Conhecidos

- GanttChart renderiza ano completo (365-366 dias × células)
- Para volumes muito grandes de RoadmapItems, considerar virtualização
- Dashboard usa agregações Prisma (_count) para contagens

### 8.3 Estratégias de Cache

- Estado local via React hooks
- Token JWT em localStorage
- Re-fetch após operações CRUD

### 8.4 Planos de Scale

- **Horizontal**: Containerização via Docker permite scale de API
- **Database**: PostgreSQL via Supabase oferece connection pooling
- **CDN**: Frontend pode ser servido via Vercel/Netlify CDN

---

## 9. Padrões de Projeto

### 9.1 Arquitetura

| Padrão | Aplicação |
|--------|-----------|
| **Layered Architecture** | Routes → Controllers → Services → Repositories |
| **Repository Pattern** | Prisma Client abstrai acesso a dados |
| **Context/Provider** | AuthContext para estado global de autenticação |

### 9.2 Frontend

| Padrão | Aplicação |
|--------|-----------|
| **Presentational/Container** | Pages (container) + Components (presentational) |
| **Custom Hooks** | useMemo para cálculos, useEffect para side effects |
| **Compound Components** | GanttChart com expanded state |

### 9.3 Backend

| Padrão | Aplicação |
|--------|-----------|
| **Controller Pattern** | Um controller por recurso (auth, product, roadmap) |
| **Middleware Pattern** | Auth middleware, Error handling middleware |
| **Repository Pattern** | Prisma Client como repositório de dados |

### 9.4 Nomenclatura

- **Componentes**: PascalCase (`ProductDetailPage.tsx`)
- **Funções/Variáveis**: camelCase (`loadProducts`, `isLoading`)
- **Arquivos**: PascalCase para componentes, camelCase para utilitários
- **Rotas API**: kebab-case (`/roadmap-items`, `/product-devs`)

---

## 10. Pontos de Integração

### 10.1 APIs Externas

| Serviço | Propósito | Endpoint/Lib |
|---------|-----------|--------------|
| **Google OAuth** | Autenticação | Passport.js + passport-google-oauth20 |
| **Supabase PostgreSQL** | Persistência | Prisma ORM + Connection String |

### 10.2 Webhooks e Eventos

- Não há webhooks configurados atualmente
- Integração futura possível via Prisma middlewares ou triggers de banco

### 10.3 Integrações Planejadas

- Confluence/Jira para links de documentação
- Ferramentas de monitoramento (Grafana, Datadog) via links em ProductEnvironment

---

## 11. Decisões de Design

### 11.1 Trade-offs

| Decisão | Alternativa Considerada | Justificativa |
|---------|------------------------|---------------|
| **Prisma ORM** | Raw SQL ou TypeORM | Type-safety end-to-end, migrations automáticas, DX excelente |
| **React Context** | Redux/Zustand | Estado simples (apenas auth); não justifica overhead |
| **Tailwind CSS** | Styled-components/CSS Modules | Velocidade de desenvolvimento, consistência visual |
| **PostgreSQL** | MongoDB | Dados relacionais (produtos → apps → devs); integridade referencial |
| **CSV Upsert** | Import simples | Necessidade de carga massiva recorrente |
| **Gantt Custom** | Biblioteca externa (DHTMLX, Bryntum) | Controles finos sobre UX, evitar dependência pesada |

### 11.2 Dívida Técnica

- Não há testes automatizados (E2E/Unit)
- Validação de formuláriosclient-side (poderia ter Zod/Yup)
- GanttChart usa CSS grid com células fixas de 32px
- Não há paginação em listas (pode ser necessário para scale)

---

## 12. Problemas Conhecidos e Melhorias Futuras

### 12.1 Issues Técnicas

- [ ] Adicionar testes unitários e E2E
- [ ] Implementar paginação em listas longas
- [ ] Adicionar validação de schemas com Zod
- [ ] Virtualizar lista do Gantt para grandes volumes

### 12.2 Débito Técnico

- Não há coverage de testes
- Validação client-side limitada
- Logging/monitoring básico

### 12.3 Roadmap de Melhorias

| Prioridade | Feature | Descrição |
|------------|---------|------------|
| Alta | Autenticação RBAC completa | Validar permissões por role em cada endpoint |
| Alta | Paginação | Adicionar skip/take em queries de lista |
| Média | Testes | Jest + React Testing Library + Playwright |
| Média | Validação | Zod schemas compartilhados |
| Baixa | Virtualização Gantt | Janelas de renderização para grandes datasets |
| Baixa | Webhooks | Eventos de mudança para integrações externas |
