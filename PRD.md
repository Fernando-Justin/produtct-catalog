# Product Requirements Document (PRD)
# ProductSQUAD Manager

**Versão:** 1.0.0
**Última Atualização:** 2026-03-22
**Autor:** Product Team

---

## 1. Visão Geral do Produto

### 1.1 Sumário Executivo

O **ProductSQUAD Manager** é uma plataforma centralizada para gestão de Catálogo de Produtos, Entregas (Roadmaps) e Sustentabilidade Técnica. Serve como "Single Source of Truth" para ecossistemas de produtos digitais, permitindo que POs/PMs, Tech Leads e Squads tenham visibilidade clara sobre saúde técnica, entregas e dependências.

### 1.2 Problema

| Problema | Impacto |
|----------|---------|
| Falta de visibilidade centralizada dos produtos | Decisões fragmentadas e desalinhamento |
| Dificuldade em rastrear entregas e deadlines | Atrasos não detectados, falta de priorização |
| Informações de stack técnica dispersas | Onboarding lento, retrabalho em investigações |
| Falta de histórico de sugestões de clientes | Feedbacks perdidos, melhorias não priorizadas |
| Dificuldade em gerenciar ambientes | Configurações perdidas, ambientes inconsistentes |

### 1.3 Solução

Uma plataforma web que centraliza:
- Catálogo de produtos com stack tecnológica
- Gestão de aplicações por produto
- Roadmap de entregas com múltiplas visualizações
- Gestão de clientes e sugestões
- Dashboard com métricas e alertas

---

## 2. Stack Tecnológica

### 2.1 Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Web)                           │
│                    React + Vite + TypeScript                     │
│                      Tailwind CSS + Radix UI                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend (API)                             │
│                    Express + TypeScript                          │
│                      Prisma ORM                                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Database                                   │
│                     PostgreSQL                                    │
│                  (Supabase ou Docker)                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Dependências Principais

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend Framework | React | ^18.3.1 |
| Build Tool | Vite | ^6.2.0 |
| Styling | Tailwind CSS | ^4.0.15 |
| UI Components | Radix UI | ^1.1.3 |
| Charts | Recharts | ^2.15.1 |
| Icons | Lucide React | ^0.483.0 |
| Backend Framework | Express | ^5.0.1 |
| ORM | Prisma | ^6.5.0 |
| Authentication | Passport.js | ^0.7.2 |
| JWT | jsonwebtoken | ^9.0.2 |
| Database | PostgreSQL | 15+ |

---

## 3. Especificações Funcionais

### 3.1 Módulo de Autenticação

#### US-001: Login de Desenvolvimento
**Como** desenvolvedor
**Quero** fazer login com nome e email
**Para** acessar o sistema em ambiente de desenvolvimento

**Critérios de Aceitação:**
```gherkin
Scenario: Login com sucesso
  Given estou na página de login
  When insiro nome "Dev User" e email "dev@example.com"
  And clico em "Entrar"
  Then sou redirecionado para o dashboard
  And recebo um token JWT válido

Scenario: Login inválido
  Given estou na página de login
  When insiro email inválido
  And clico em "Entrar"
  Then vejo mensagem de erro "Email inválido"
```

**Especificação Técnica:**
```
POST /api/auth/dev-login
Request Body:
  {
    "name": string (required, min 2 chars),
    "email": string (required, valid email format)
  }
Response 200:
  {
    "token": string (JWT),
    "user": {
      "id": number,
      "name": string,
      "email": string,
      "roleId": number,
      "role": { "id": number, "name": string, "type": string }
    }
  }
Response 400: { "error": "Nome e email são obrigatórios" }
```

#### US-002: Login com Google OAuth
**Como** usuário
**Quero** fazer login com minha conta Google
**Para** acessar o sistema sem criar credenciais adicionais

**Critérios de Aceitação:**
```gherkin
Scenario: Login com Google
  Given estou na página de login
  When clico em "Entrar com Google"
  Then sou redirecionado para a página de autenticação do Google
  When autorizo o acesso
  Then sou redirecionado de volta para o dashboard
  And recebo um token JWT válido
```

**Especificação Técnica:**
```
GET /api/auth/google
  -> Redireciona para Google OAuth Consent Screen

GET /api/auth/google/callback
  -> Processa callback do Google
  -> Cria/atualiza usuário no banco
  -> Redireciona para FRONTEND_URL/auth/callback?token=<JWT>

GET /api/auth/me
Headers: Authorization: Bearer <JWT>
Response 200:
  {
    "id": number,
    "name": string,
    "email": string,
    "roleId": number,
    "squadId": number | null,
    "status": "ATIVO" | "INATIVO"
  }
```

---

### 3.2 Módulo de Catálogo de Produtos

#### US-003: Listar Produtos
**Como** usuário
**Quero** ver uma lista de todos os produtos
**Para** ter visibilidade do catálogo existente

**Critérios de Aceitação:**
```gherkin
Scenario: Listar produtos
  Given estou autenticado
  When acesso a página de produtos
  Then vejo uma lista com todos os produtos
  And cada produto mostra nome, status, squad e descrição

Scenario: Buscar produtos
  Given estou na página de produtos
  When digito um termo de busca
  Then a lista é filtrada por produtos que contêm o termo
```

**Especificação Técnica:**
```
GET /api/products
Headers: Authorization: Bearer <JWT>
Response 200:
  [
    {
      "id": number,
      "name": string,
      "description": string | null,
      "purpose": string | null,
      "status": "ATIVO" | "INATIVO" | "DEPRECIADO" | "PLANEJADO",
      "squadId": number | null,
      "confluenceUrl": string | null,
      "createdAt": datetime,
      "updatedAt": datetime,
      "squad": { "id": number, "name": string },
      "stacks": ProductStack[],
      "_count": { "devs": number, "apps": number, "clients": number }
    }
  ]
```

#### US-004: Criar Produto
**Como** PO/Admin
**Quero** criar um novo produto no catálogo
**Para** documentar novos produtos da organização

**Critérios de Aceitação:**
```gherkin
Scenario: Criar produto válido
  Given estou autenticado como PO ou Admin
  And estou na página de produtos
  When clico em "Novo Produto"
  And preencho nome "Produto X", descrição "Descrição", propósito "Propósito"
  And seleciono status "ATIVO"
  And seleciono uma Squad
  And clico em "Salvar"
  Then o produto é criado com sucesso
  And vejo mensagem de confirmação
```

**Especificação Técnica:**
```
POST /api/products
Headers: Authorization: Bearer <JWT>
Request Body:
  {
    "name": string (required, max 255 chars),
    "description": string (optional),
    "purpose": string (optional),
    "status": "ATIVO" | "INATIVO" | "DEPRECIADO" | "PLANEJADO" (default: "ATIVO"),
    "squadId": number (optional),
    "confluenceUrl": string (optional, valid URL)
  }
Response 201: Product object
```

#### US-005: Editar Produto
**Como** PO/Admin
**Quero** editar um produto existente
**Para** manter informações atualizadas

**Especificação Técnica:**
```
PUT /api/products/:id
Headers: Authorization: Bearer <JWT>
Request Body: Same as POST
Response 200: Product object
```

#### US-006: Excluir Produto
**Como** Admin
**Quero** excluir um produto
**Para** remover produtos descontinuados

**Especificação Técnica:**
```
DELETE /api/products/:id
Headers: Authorization: Bearer <JWT>
Response 204: No content
Response 404: { "error": "Produto não encontrado" }
```

---

### 3.3 Módulo de Stack Tecnológica

#### US-007: Gerenciar Stack do Produto
**Como** Tech Lead
**Quero** adicionar/remover tecnologias do produto
**Para** manter a documentação técnica atualizada

**Critérios de Aceitação:**
```gherkin
Scenario: Adicionar tecnologia
  Given estou na página de detalhes do produto
  And na aba "Stack"
  When seleciono tecnologia "REACT"
  And seleciono ambiente "PRODUCAO"
  And insiro versão "18.3"
  And clico em "Adicionar"
  Then a tecnologia é adicionada ao produto

Scenario: Remover tecnologia
  Given estou na aba "Stack" do produto
  When clico no ícone de lixeira na tecnologia "REACT"
  Then a tecnologia é removida
```

**Especificação Técnica:**
```
POST /api/products/:productId/stacks
Request Body:
  {
    "stack": StackType (enum),
    "environment": "HOMOLOGACAO" | "PRODUCAO" | "AMBOS",
    "version": string (optional)
  }

DELETE /api/products/:productId/stacks/:id
```

**Enum StackType:**
```typescript
type StackType =
  | 'JAVA' | 'GO_LANG' | 'PYTHON' | 'REACT' | 'NODEJS'
  | 'DOTNET' | 'RUST' | 'TYPESCRIPT' | 'PHP' | 'SPRING_BOOT'
  | 'GIN' | 'FAST_API' | 'NEXT_JS' | 'EXPRESS' | 'NEST_JS'
  | 'ASP_NET_CORE' | 'LARAVEL' | 'SYMFONY' | 'POSTGRESQL'
  | 'MYSQL' | 'ORACLE' | 'SQL_SERVER' | 'NOSQL' | 'MONGODB'
  | 'REDIS' | 'KEYDB' | 'OUTROS'
```

---

### 3.4 Módulo de Aplicações (Apps)

#### US-008: Gerenciar Aplicações do Produto
**Como** PO/Dev
**Quero** adicionar aplicações subordinadas ao produto
**Para** organizar microsserviços e componentes

**Critérios de Aceitação:**
```gherkin
Scenario: Criar aplicação
  Given estou na aba "Aplicações" do produto
  When clico em "Nova Aplicação"
  And preencho nome "API Gateway", descrição "Gateway principal"
  And seleciono status "ATIVO"
  And clico em "Salvar"
  Then a aplicação é criada

Scenario: Editar aplicação
  Given existe uma aplicação "API Gateway"
  When clico em "Editar"
  And altero a descrição
  Then a aplicação é atualizada
```

**Especificação Técnica:**
```
GET /api/products/:productId/apps
Response 200: App[]

POST /api/products/:productId/apps
Request Body:
  {
    "name": string (required),
    "description": string (optional),
    "status": "ATIVO" | "INATIVO" | "DEPRECIADO" | "PLANEJADO"
  }

PUT /api/apps/:id
DELETE /api/apps/:id
```

---

### 3.5 Módulo de Desenvolvedores

#### US-009: Atribuir Desenvolvedores ao Produto
**Como** PO
**Quero** atribuir desenvolvedores aos produtos
**Para** documentar quem é responsável

**Critérios de Aceitação:**
```gherkin
Scenario: Adicionar desenvolvedor
  Given estou na aba "Devs" do produto
  When seleciono um desenvolvedor da lista
  And marco como "Tech Lead" se aplicável
  And clico em "Adicionar"
  Then o desenvolvedor é atribuído ao produto
```

**Especificação Técnica:**
```
POST /api/products/:productId/devs
Request Body:
  {
    "userId": number (required),
    "isLead": boolean (default: false)
  }

DELETE /api/products/:productId/devs/:userId
```

---

### 3.6 Módulo de Clientes

#### US-010: Gerenciar Clientes do Produto
**Como** PO
**Quero** cadastrar clientes/consumidores do produto
**Para** rastrear quem utiliza o produto

**Especificação Técnica:**
```
GET /api/products/:productId/clients
Response 200: Client[]

POST /api/products/:productId/clients
Request Body:
  {
    "name": string (required),
    "squadOrContact": string (optional)
  }

PUT /api/products/:productId/clients/:id
DELETE /api/products/:productId/clients/:id
```

#### US-011: Gerenciar Sugestões de Clientes
**Como** PO
**Quero** registrar sugestões de melhoria dos clientes
**Para** priorizar backlog

**Especificação Técnica:**
```
POST /api/clients/:clientId/suggestions
Request Body:
  {
    "title": string (required),
    "description": string (optional),
    "type": string (optional)
  }

PUT /api/suggestions/:id
DELETE /api/suggestions/:id
```

---

### 3.7 Módulo de Ambientes

#### US-012: Gerenciar Configurações de Ambiente
**Como** DevOps/Tech Lead
**Quero** documentar URLs e configurações de ambientes
**Para** facilitar onboarding e troubleshooting

**Critérios de Aceitação:**
```gherkin
Scenario: Configurar ambiente de produção
  Given estou na aba "Ambientes" do produto
  When seleciono ambiente "PRODUCAO"
  And insiro Cluster URL "https://k8s.prod.internal"
  And insiro Logs URL "https://logs.prod.internal"
  And insiro ArgoCD URL "https://argo.prod.internal"
  And insiro Datadog URL "https://app.datadog.com/..."
  And insiro Grafana URL "https://grafana.prod.internal"
  And clico em "Salvar"
  Then as configurações são salvas
```

**Especificação Técnica:**
```
PUT /api/products/:productId/environments/:envName
Request Body:
  {
    "clusterUrl": string (optional),
    "logsUrl": string (optional),
    "argoUrl": string (optional),
    "datadogUrl": string (optional),
    "grafanaUrl": string (optional)
  }

PUT /api/products/:productId/databases/:envName
Request Body:
  {
    "host": string (optional),
    "database": string (optional),
    "username": string (optional),
    "password": string (optional),
    "port": number (optional)
  }
```

---

### 3.8 Módulo de Roadmap/Delivery

#### US-013: Visualizar Roadmap Global
**Como** PO/Manager
**Quero** ver todas as entregas de todos os produtos
**Para** ter visão macro das entregas

**Critérios de Aceitação:**
```gherkin
Scenario: Ver roadmap global
  Given estou autenticado
  When acesso a página "Delivery"
  Then vejo todas as entregas de todos os produtos
  And posso alternar entre visualização Kanban e Lista
```

**Especificação Técnica:**
```
GET /api/roadmap
Headers: Authorization: Bearer <JWT>
Response 200: RoadmapItem[]
```

#### US-014: Criar Item de Roadmap
**Como** PO
**Quero** criar entregas no roadmap
**Para** planejar e comunicar entregas

**Critérios de Aceitação:**
```gherkin
Scenario: Criar entrega
  Given estou na página de delivery ou aba delivery do produto
  When clico em "Nova Entrega"
  And preencho título, descrição, produto, effort, data planejada
  And seleciono status "BACKLOG"
  And atribuo responsável
  And clico em "Salvar"
  Then a entrega é criada
```

**Especificação Técnica:**
```
POST /api/roadmap
Request Body:
  {
    "productId": number (required),
    "title": string (required, max 255 chars),
    "description": string (optional),
    "status": "BACKLOG" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "ARCHIVED" (default: "BACKLOG"),
    "effort": "PP" | "P" | "M" | "G" | "GG" (optional),
    "plannedDate": datetime (optional),
    "assigneeId": number (optional),
    "completion": number (optional, 0-100, default: 0),
    "riskPoint": string (optional),
    "confluenceUrl": string (optional)
  }
```

#### US-015: Atualizar Status de Entrega
**Como** PO/Dev
**Quero** atualizar o status das entregas
**Para** refletir progresso real

**Especificação Técnica:**
```
PUT /api/roadmap/:id
Request Body: Partial<RoadmapItem>
Response 200: RoadmapItem
```

#### US-016: Importar Entregas via CSV
**Como** PO
**Quero** importar entregas em massa via CSV
**Para** agilizar criação de múltiplas entregas

**Critérios de Aceitação:**
```gherkin
Scenario: Importar CSV
  Given estou na página de delivery global
  When clico em "Importar CSV"
  And seleciono arquivo CSV com colunas: title,description,productName,status,effort,plannedDate,assigneeName,completion,riskPoint,confluenceUrl
  And clico em "Importar"
  Then as entregas são criadas sem duplicatas
```

**Formato CSV:**
```csv
title,description,productName,status,effort,plannedDate,assigneeName,completion,riskPoint,confluenceUrl
"Feature X","Descricao","Produto A","BACKLOG","M","2026-04-01","João Silva","0","",""
```

**Especificação Técnica:**
```
POST /api/roadmap/import
Content-Type: multipart/form-data
Request Body: file (CSV)
Response 200:
  {
    "imported": number,
    "skipped": number,
    "items": RoadmapItem[]
  }
```

#### US-017: Exportar Entregas para CSV
**Como** PO
**Quero** exportar entregas para CSV
**Para** compartilhar com stakeholders externos

**Critérios de Aceitação:**
```gherkin
Scenario: Exportar CSV
  Given estou na página de delivery global
  When clico em "Exportar CSV"
  Then um arquivo CSV é baixado com todas as entregas
```

---

### 3.9 Módulo de Dashboard

#### US-018: Visualizar Dashboard com Métricas
**Como** Manager/PO
**Quero** ver métricas consolidadas
**Para** tomada de decisão baseada em dados

**Critérios de Aceitação:**
```gherkin
Scenario: Ver dashboard
  Given estou autenticado
  When acesso o dashboard
  Then vejo cards com contagens totais (produtos, apps, devs, clientes)
  And vejo gráfico de pizza de status de atividades
  And vejo gráfico de barras de distribuição de effort
  And vejo gráfico de entregas por produto
  And vejo alertas de deadlines (vencidos, próximos, futuros)
```

**Especificação Técnica:**
```
GET /api/dashboard/stats
Response 200:
  {
    "totalProducts": number,
    "totalApps": number,
    "totalDevs": number,
    "totalClients": number,
    "statusDistribution": { [status: string]: number },
    "effortDistribution": { [effort: string]: number },
    "deliveriesByProduct": { [productName: string]: number },
    "deliveriesByUser": { [userName: string]: number },
    "stackUsage": { [stack: string]: number },
    "deadlineAlerts": {
      "overdue": RoadmapItem[],
      "soon": RoadmapItem[],
      "future": RoadmapItem[]
    }
  }
```

---

### 3.10 Módulo de Usuários e Squads

#### US-019: Gerenciar Usuários
**Como** Admin
**Quero** gerenciar usuários do sistema
**Para** controle de acesso e atribuição

**Especificação Técnica:**
```
GET /api/users
POST /api/users
Request Body:
  {
    "name": string (required),
    "email": string (required, unique),
    "roleId": number,
    "squadId": number (optional),
    "status": "ATIVO" | "INATIVO",
    "cpf": string (optional),
    "admissionDate": datetime (optional),
    "address": string (optional)
  }
PUT /api/users/:id
DELETE /api/users/:id
```

#### US-020: Gerenciar Squads
**Como** Admin
**Quero** gerenciar squads (times)
**Para** organizar times e atribuir produtos

**Especificação Técnica:**
```
GET /api/squads
POST /api/squads
Request Body:
  {
    "name": string (required),
    "description": string (optional)
  }
PUT /api/squads/:id
DELETE /api/squads/:id
```

---

### 3.11 Módulo de Roles

#### US-021: Gerenciar Roles
**Como** Admin
**Quero** gerenciar roles do sistema
**Para** definir níveis de acesso

**Roles Predefinidas:**
| Role | Descrição | Permissões |
|------|-----------|------------|
| ADMIN | Administrador total | CRUD completo em todas entidades |
| PO | Product Owner | Gerencia produtos, roadmaps, clientes |
| DEV | Desenvolvedor | Visualização e edição limitada |
| SQUAD_LEAD | Líder de Squad | Gerencia produtos do seu squad |
| VIEWER | Visualizador | Apenas leitura |

**Especificação Técnica:**
```
GET /api/roles
POST /api/roles
PUT /api/roles/:id
DELETE /api/roles/:id
```

---

## 4. Modelo de Dados

### 4.1 Diagrama Entidade-Relacionamento

```
┌─────────┐       ┌─────────┐       ┌─────────┐
│  User   │───────│  Squad  │───────│ Product │
└─────────┘       └─────────┘       └─────────┘
     │                                   │
     │                                   │
     ▼                                   ▼
┌─────────┐                       ┌──────────────┐
│  Role   │                       │ ProductStack │
└─────────┘                       └──────────────┘
     │                                   │
     │                             ┌──────────────┐
     │                             │ProductDev    │
     │                             └──────────────┘
     │                             ┌──────────────┐
     │                             │ProductEnv    │
     │                             └──────────────┘
     │                             ┌──────────────┐
     │                             │ProductDatabase│
     │                             └──────────────┘
     │                             ┌──────────────┐
     │                             │ ProductLink  │
     │                             └──────────────┘
     │                             ┌──────────────┐
     │                             │     App      │
     │                             └──────────────┘
     │                                   │
     │                             ┌──────────────┐
     │                             │   AppStack   │
     │                             └──────────────┘
     │                             ┌──────────────┐
     │                             │ AppEnvironment│
     │                             └──────────────┘
     │                             ┌──────────────┐
     │                             │   AppLink    │
     │                             └──────────────┘
     │                             ┌──────────────┐
     │                             │   Client     │
     │                             └──────────────┘
     │                                   │
     │                             ┌──────────────┐
     │                             │ClientSuggestion│
     │                             └──────────────┘
     │                             ┌──────────────┐
     └─────────────────────────────│ RoadmapItem  │
                                   └──────────────┘
```

### 4.2 Schema Prisma Completo

```prisma
// Enums
enum RoleType {
  ADMIN
  PO
  DEV
  SQUAD_LEAD
  VIEWER
}

enum StatusGeneral {
  ATIVO
  INATIVO
}

enum StackType {
  JAVA GO_LANG PYTHON REACT NODEJS DOTNET RUST TYPESCRIPT PHP
  SPRING_BOOT GIN FAST_API NEXT_JS EXPRESS NEST_JS ASP_NET_CORE
  LARAVEL SYMFONY POSTGRESQL MYSQL ORACLE SQL_SERVER NOSQL
  MONGODB REDIS KEYDB OUTROS
}

enum Environment {
  HOMOLOGACAO
  PRODUCAO
  AMBOS
}

enum ProductStatus {
  ATIVO
  INATIVO
  DEPRECIADO
  PLANEJADO
}

enum ActivityStatus {
  BACKLOG
  IN_PROGRESS
  BLOCKED
  DONE
  ARCHIVED
}

enum EffortLevel {
  PP  // Extra Pequeno
  P   // Pequeno
  M   // Médio
  G   // Grande
  GG  // Extra Grande
}

// Models
model User {
  id             Int            @id @default(autoincrement())
  email          String         @unique
  name           String
  googleId       String?        @unique
  cpf            String?
  admissionDate  DateTime?
  address        String?
  phone          String?
  status         StatusGeneral  @default(ATIVO)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  roleId         Int
  role           Role           @relation(fields: [roleId], references: [id])
  squadId        Int?
  squad          Squad?         @relation(fields: [squadId], references: [id])
  productDevs    ProductDev[]
  roadmapItems   RoadmapItem[]
}

model Role {
  id            Int      @id @default(autoincrement())
  name          String   @unique
  type          RoleType @unique
  description   String?
  users         User[]
}

model Squad {
  id            Int            @id @default(autoincrement())
  name          String         @unique
  description   String?
  users         User[]
  products      Product[]
}

model Product {
  id              Int               @id @default(autoincrement())
  name            String
  description     String?
  purpose         String?
  status          ProductStatus     @default(ATIVO)
  squadId         Int?
  confluenceUrl   String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  squad           Squad?            @relation(fields: [squadId], references: [id])
  stacks          ProductStack[]
  devs            ProductDev[]
  environments    ProductEnvironment[]
  databases       ProductDatabase[]
  links           ProductLink[]
  apps            App[]
  clients         Client[]
  roadmapItems    RoadmapItem[]
}

model ProductStack {
  id            Int         @id @default(autoincrement())
  productId     Int
  stack         StackType
  environment   Environment @default(AMBOS)
  version       String?
  product       Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([productId, stack, environment])
}

model ProductDev {
  id          Int      @id @default(autoincrement())
  productId   Int
  userId      Int
  isLead      Boolean  @default(false)
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([productId, userId])
}

model ProductEnvironment {
  id          Int         @id @default(autoincrement())
  productId   Int
  environment Environment
  clusterUrl  String?
  logsUrl     String?
  argoUrl     String?
  datadogUrl  String?
  grafanaUrl  String?
  product     Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([productId, environment])
}

model ProductDatabase {
  id          Int         @id @default(autoincrement())
  productId   Int
  environment Environment
  host        String?
  database    String?
  username    String?
  password    String?
  port        Int?
  product     Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  @@unique([productId, environment])
}

model ProductLink {
  id          Int      @id @default(autoincrement())
  productId   Int
  label       String
  url         String
  category    String?
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model App {
  id            Int              @id @default(autoincrement())
  productId     Int
  name          String
  description   String?
  status        ProductStatus    @default(ATIVO)
  product       Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  stacks        AppStack[]
  environments  AppEnvironment[]
  links         AppLink[]
}

model AppStack {
  id          Int         @id @default(autoincrement())
  appId       Int
  stack       StackType
  environment Environment @default(AMBOS)
  version     String?
  app         App         @relation(fields: [appId], references: [id], onDelete: Cascade)
  @@unique([appId, stack, environment])
}

model AppEnvironment {
  id          Int         @id @default(autoincrement())
  appId       Int
  environment Environment
  clusterUrl  String?
  logsUrl     String?
  argoUrl     String?
  datadogUrl  String?
  grafanaUrl  String?
  app         App         @relation(fields: [appId], references: [id], onDelete: Cascade)
  @@unique([appId, environment])
}

model AppLink {
  id        Int      @id @default(autoincrement())
  appId     Int
  label     String
  url       String
  app       App      @relation(fields: [appId], references: [id], onDelete: Cascade)
}

model Client {
  id            Int              @id @default(autoincrement())
  productId     Int
  name          String
  squadOrContact String?
  product       Product          @relation(fields: [productId], references: [id], onDelete: Cascade)
  suggestions   ClientSuggestion[]
}

model ClientSuggestion {
  id          Int      @id @default(autoincrement())
  clientId    Int
  title       String
  description String?
  type        String?
  status      String?
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
}

model RoadmapItem {
  id            Int            @id @default(autoincrement())
  productId     Int
  title         String
  description   String?
  status        ActivityStatus @default(BACKLOG)
  effort        EffortLevel?
  plannedDate   DateTime?
  assigneeId    Int?
  completion    Int            @default(0)
  riskPoint     String?
  confluenceUrl String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  product       Product        @relation(fields: [productId], references: [id], onDelete: Cascade)
  assignee      User?          @relation(fields: [assigneeId], references: [id])
}
```

---

## 5. Especificações de Interface (UI/UX)

### 5.1 Design System

#### 5.1.1 Paleta de Cores
| Uso | Tailwind Class | Hex |
|-----|----------------|-----|
| Primary | `blue-500` / `blue-600` | #3B82F6 / #2563EB |
| Success | `green-500` | #22C55E |
| Warning | `yellow-500` | #EAB308 |
| Danger | `red-500` | #EF4444 |
| Background | `slate-50` | #F8FAFC |
| Surface | `white` | #FFFFFF |
| Text Primary | `slate-900` | #0F172A |
| Text Secondary | `slate-500` | #64748B |

#### 5.1.2 Tipografia
- **Font Family:** Inter (system-ui fallback)
- **Headings:** font-weight 600 (semibold)
- **Body:** font-weight 400 (normal)
- **Sizes:** text-xs (12px), text-sm (14px), text-base (16px), text-lg (18px)

#### 5.1.3 Componentes Base
- **Cards:** `bg-white rounded-xl border border-slate-200 shadow-sm`
- **Buttons Primary:** `bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2`
- **Buttons Secondary:** `bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg px-4 py-2`
- **Inputs:** `border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500`
- **Badges:** `px-2 py-1 rounded-full text-xs font-medium`

### 5.2 Estrutura de Páginas

#### 5.2.1 Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐                                               │
│  │ Sidebar  │  ┌─────────────────────────────────────────┐  │
│  │          │  │ Topbar                                 │  │
│  │  Nav     │  │ [User] [Notifications]                 │  │
│  │  Items   │  └─────────────────────────────────────────┘  │
│  │          │  ┌─────────────────────────────────────────┐  │
│  │  - Dash  │  │                                        │  │
│  │  - Prod  │  │                                        │  │
│  │  - Deliv │  │           Main Content                 │  │
│  │  - Squad │  │                                        │  │
│  │  - Users │  │                                        │  │
│  │  - Roles │  │                                        │  │
│  │          │  │                                        │  │
│  └──────────┘  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.2 Página de Login
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ┌─────────────────────────────┐                │
│              │       ProductSQUAD          │                │
│              │       Manager               │                │
│              │                             │                │
│              │  Nome: [________________]    │                │
│              │                             │                │
│              │  Email: [________________]   │                │
│              │                             │                │
│              │  [    Entrar    ]            │                │
│              │                             │                │
│              │  ───────── ou ──────────     │                │
│              │                             │ │
│              │  [  🔵 Entrar com Google  ]  │                │
│              └─────────────────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.3 Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                                   │
├─────────────────────────────────────────────────────────────┤
│ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                     │
│ │  12   │ │  45   │ │  89   │ │  34   │                     │
│ │ Prod  │ │ Apps  │ │ Devs  │ │Client │                     │
│ └───────┘ └───────┘ └───────┘ └───────┘                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐                     │
│ │  Status Pie     │ │  Effort Bar     │                     │
│ └─────────────────┘ └─────────────────┘                     │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Deliveries by Product (Bar Chart)                       │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Deadline Alerts                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Overdue (3) │ ⏰ Soon (5) │ 📅 Future (12)          │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.4 Lista de Produtos
```
┌─────────────────────────────────────────────────────────────┐
│ Produtos                                      [+ Novo]      │
│ [Buscar________________] [Status ▼] [Squad ▼]              │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Produto A                                    🟢 ATIVO   │ │
│ │ Squad: Alpha | 5 apps | 8 devs | 2 clients               │ │
│ │ React, NodeJS, PostgreSQL                               │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Produto B                                  🔴 INATIVO  │ │
│ │ Squad: Beta | 3 apps | 5 devs | 1 client                │ │
│ │ Java, Spring Boot, Oracle                               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.5 Detalhes do Produto (Tabs)
```
┌─────────────────────────────────────────────────────────────┐
│ ← Voltar    Produto A                             [Editar] │
├─────────────────────────────────────────────────────────────┤
│ [Overview] [Stack] [Apps] [Devs] [Clients] [Env] [Delivery]│
├─────────────────────────────────────────────────────────────┤
│ Overview Tab:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Nome: Produto A                                         │ │
│ │ Status: 🟢 ATIVO                                        │ │
│ │ Squad: Alpha                                            │ │
│ │ Confluence: https://confluence...                       │ │
│ │                                                         │ │
│ │ Descrição: Sistema de gestão de...                     │ │
│ │ Propósito: Facilitar o controle de...                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Links:                                                     │
│ ┌──────────────────┐ ┌──────────────────┐                 │
│ │ 📄 Documentação  │ │ 🔗 API Docs       │                 │
│ └──────────────────┘ └──────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.6 Roadmap/Delivery (Kanban)
```
┌─────────────────────────────────────────────────────────────┐
│ Delivery                               [Import CSV] [Export]│
│ [Kanban] [Lista] [Timeline]                                │
├─────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│ │ BACKLOG  │ │IN_PROGRESS│ │  BLOCKED  │ │   DONE    │     │
│ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤     │
│ │ Task 1   │ │ Task 3   │ │ Task 5   │ │ Task 2   │     │
│ │ P | Apr  │ │ M | May  │ │ G | Jun  │ │ PP | Mar │     │
│ │ João     │ │ Maria    │ │ Pedro    │ │ Ana      │     │
│ │ ▱▱▱▱ 0%  │ │ ▱▱▱▱ 25% │ │ ▱▱▱▱ 50% │ │ ▰▰▰▰ 100%│     │
│ │          │ │          │ │          │ │          │     │
│ │ Task 4   │ │ Task 6   │ │          │ │ Task 7   │     │
│ │ G | Jul  │ │ M | Aug  │ │          │ │ P | Feb  │     │
│ │ Carlos   │ │ Ana      │ │          │ │ Maria    │     │
│ │ ▱▱▱▱ 0%  │ │ ▱▱▱▱ 10% │ │          │ │ ▰▰▰▰ 100%│     │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Especificações Não-Funcionais

### 6.1 Performance

| Requisito | Especificação |
|-----------|---------------|
| Tempo de resposta API | < 200ms para operações de leitura |
| Tempo de carregamento inicial | < 3s em conexão 3G |
| Listas paginadas | Máximo 50 itens por página |
| Imagens otimizadas | Lazy loading para imagens |

### 6.2 Segurança

| Requisito | Especificação |
|-----------|---------------|
| Autenticação | JWT com expiração de 7 dias |
| Senhas | Hash bcrypt (se implementado login local) |
| CORS | Configurado para domínios permitidos |
| SQL Injection | Protegido via Prisma ORM |
| XSS | Protegido via React (escape automático) |
| Variáveis sensíveis | Arquivo .env não versionado |

### 6.3 Disponibilidade

| Requisito | Especificação |
|-----------|---------------|
| Uptime | 99.5% mínimo |
| Backup | Diário automático |
| Failover | Suportado via Supabase/PostgreSQL |

### 6.4 Compatibilidade

| Plataforma | Versões Suportadas |
|------------|-------------------|
| Chrome | Últimas 2 versões |
| Firefox | Últimas 2 versões |
| Safari | Últimas 2 versões |
| Edge | Últimas 2 versões |
| Mobile | iOS Safari, Chrome Android |

---

## 7. API Endpoints Summary

### 7.1 Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/dev-login` | No | Development login |
| GET | `/api/auth/google` | No | Google OAuth redirect |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |
| GET | `/api/auth/me` | Yes | Get current user |

### 7.2 Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | Yes | List all products |
| GET | `/api/products/:id` | Yes | Get product details |
| POST | `/api/products` | Yes | Create product |
| PUT | `/api/products/:id` | Yes | Update product |
| DELETE | `/api/products/:id` | Yes | Delete product |

### 7.3 Product Relations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products/:id/devs` | Add developer |
| DELETE | `/api/products/:id/devs/:userId` | Remove developer |
| POST | `/api/products/:id/stacks` | Add tech stack |
| DELETE | `/api/products/:id/stacks/:stackId` | Remove stack |
| PUT | `/api/products/:id/environments/:env` | Upsert environment |
| PUT | `/api/products/:id/databases/:env` | Upsert database |
| POST | `/api/products/:id/links` | Add link |
| DELETE | `/api/products/:id/links/:linkId` | Remove link |
| GET | `/api/products/:id/clients` | List clients |
| POST | `/api/products/:id/clients` | Add client |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Delete client |

### 7.4 Apps
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/:productId/apps` | List apps |
| POST | `/api/products/:productId/apps` | Create app |
| PUT | `/api/apps/:id` | Update app |
| DELETE | `/api/apps/:id` | Delete app |

### 7.5 Roadmap
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/roadmap` | List all items (global) |
| GET | `/api/products/:id/roadmap` | List product items |
| POST | `/api/roadmap` | Create item |
| PUT | `/api/roadmap/:id` | Update item |
| DELETE | `/api/roadmap/:id` | Delete item |
| POST | `/api/roadmap/import` | Import CSV |

### 7.6 Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get statistics |

### 7.7 Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |
| GET | `/api/squads` | List squads |
| POST | `/api/squads` | Create squad |
| PUT | `/api/squads/:id` | Update squad |
| DELETE | `/api/squads/:id` | Delete squad |
| GET | `/api/roles` | List roles |
| POST | `/api/roles` | Create role |
| PUT | `/api/roles/:id` | Update role |
| DELETE | `/api/roles/:id` | Delete role |

---

## 8. Roadmap de Desenvolvimento

### Fase 1 - MVP (Concluído)
- [x] Setup monorepo (Turborepo)
- [x] Database schema e migrations
- [x] API REST com Express
- [x] Frontend React com Vite
- [x] Autenticação JWT + Google OAuth
- [x] CRUD de Produtos
- [x] CRUD de Aplicações
- [x] CRUD de Usuários e Squads
- [x] Dashboard básico

### Fase 2 - Roadmap Module (Concluído)
- [x] Modelo Kanban para entregas
- [x] Visualização Lista
- [x] Visualização Timeline
- [x] Importação CSV
- [x] Exportação CSV
- [x] Percentual de conclusão
- [x] Riscos/Impedimentos
- [x] Status ARCHIVED

### Fase 3 - Melhorias (Backlog)
- [ ] Permissões granulares por role
- [ ] Notificações por email
- [ ] Relatórios exportáveis PDF
- [ ] Gráfico de Gantt para timeline
- [ ] Filtros avançados no roadmap
- [ ] Comentários em entregas
- [ ] Histórico de alterações (audit log)

### Fase 4 - Integrações (Futuro)
- [ ] Integração Jira
- [ ] Integração GitHub
- [ ] Integração Confluence (bidirecional)
- [ ] Webhooks para eventos
- [ ] API pública com rate limiting

---

## 9. Ambiente e Configuração

### 9.1 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

### 9.2 Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Rodar migrations
npx prisma migrate dev

# Abrir Prisma Studio
npx prisma studio

# Rodar testes
npm run test
```

---

## 10. Glossário

| Termo | Definição |
|-------|-----------|
| **Product** | Produto de software gerenciado no catálogo |
| **App** | Aplicação subordinada a um produto (microsserviço, frontend, etc.) |
| **Squad** | Time de desenvolvimento responsável por produtos |
| **Roadmap** | Plano de entregas com timeline |
| **Delivery** | Item individual do roadmap (entrega) |
| **Stack** | Conjunto de tecnologias utilizadas |
| **PO** | Product Owner |
| **Tech Lead** | Líder técnico de um produto |
| **Effort** | Estimativa de esforço (PP, P, M, G, GG) |
| **Completion** | Percentual de conclusão de uma entrega |

---

## 11. Histórico de Revisões

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0.0 | 2026-03-22 | Product Team | Versão inicial do PRD |

---

## 12. Referências

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)
- [Express.js Documentation](https://expressjs.com)
- [Passport.js Documentation](http://www.passportjs.org/docs)