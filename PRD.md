# ProductSQUAD Manager - PRD (Product Requirement Document)

## 1. Visão Geral
O **ProductSQUAD Manager** é uma plataforma centralizada para gestão de produtos digitais, aplicações e roadmaps. O objetivo é eliminar a fragmentação de informações (planilhas, docs, silos) e fornecer uma **"Single Source of Truth"** para líderes de produto, desenvolvedores e stakeholders.

O projeto utiliza a metodologia **SDD (Spec-Driven Development)**, onde as especificações orientam diretamente o desenvolvimento assistido por agentes de IA.

## 2. O Problema
- **Fragmentação de Dados**: Informações sobre stacks, ambientes e links úteis espalhadas em diferentes locais.
- **Falta de Visibilidade**: Dificuldade em visualizar o roadmap global de múltiplos produtos de forma consolidada (foco em "Gestão à Vista").
- **Complexidade de Onboarding**: Novos membros levam tempo para entender o ecossistema técnico de um produto.

## 3. A Solução
- **Catálogo Centralizado**: Cadastro detalhado de produtos, squads, stacks e aplicações subordinadas.
- **Gráfico de Gantt & Kanban**: Visualização interativa e integrada de roadmaps com foco em prazos e responsáveis.
- **Dashboard Estratégico**: Métricas de saúde técnica e progresso de entregas em tempo real.

## 4. Requisitos Funcionais

### 4.1 Gestão de Catálogo
- [REQ-01] Cadastro de **Produtos** com propósito, squad responsável e documentação.
- [REQ-02] Gestão de **Aplicações** (microsserviços, frontends) vinculadas a produtos.
- [REQ-03] Detalhamento de **Tech Stack** por ambiente (HML/PRD).
- [REQ-04] Repositório de **Ambientes e Bancos de Dados** (URLs, Hosts, Logs).

### 4.2 Roadmap & Delivery (Gestão à Vista)
- [REQ-05] Visualização **Kanban** das atividades por status.
- [REQ-06] **Gráfico de Gantt Interativo** abrangendo o ano completo, com foco automático na data atual.
  - O gráfico utiliza `startDateAtividade` como início e `plannedDate` como previsão de conclusão.
- [REQ-07] Gestão de **Riscos** e percentual de conclusão das tarefas.
- [REQ-08] Importação de dados via **CSV** para carga massiva de atividades, com lógica de **deduplicação baseada em ID** (Upsert).

### 4.3 Gestão de Pessoas
- [REQ-09] Cadastro de **Usuários** (Devs, Leads, POs) e vinculação a **Squads**.
- [REQ-10] Sistema de **Roles** (ADMIN, TECH_LEAD, USER, GUEST) para controle de acesso.

### 4.4 Dashboard
- [REQ-11] Contagem consolidada de ativos (Produtos, Apps, Devs, Sugestões).
- [REQ-12] Gráficos de esforço por produto e distribuição de status.

## 5. User Stories
| ID | Ator | Desejo | Motivo |
|----|------|--------|--------|
| US01 | Tech Lead | Visualizar o gráfico de Gantt | Identificar gargalos e atrasos nas entregas de forma visual. |
| US02 | Dev | Consultar a stack de um produto | Saber quais linguagens e versões são utilizadas em PRD. |
| US03 | PO | Importar atividades via CSV | Agilizar a atualização do roadmap vindo de outras ferramentas. |
| US04 | Admin | Configurar Roles e Squads | Garantir que cada usuário tenha acesso apenas ao que lhe compete. |

## 6. Modelo de Dados (Spec Core)

```prisma
enum RoleType { ADMIN; TECH_LEAD; USER; GUEST }
enum Environment { HOMOLOGACAO; PRODUCAO; AMBOS }
enum ProductStatus { ATIVO; INATIVO; DEPRECIADO; PLANEJADO }
enum ActivityStatus { BACKLOG; IN_PROGRESS; BLOCKED; DONE; ARCHIVED }

model Product {
  id            Int      @id @default(autoincrement())
  name          String
  squadId       Int?
  status        ProductStatus @default(ATIVO)
  apps          App[]
  roadmapItems  RoadmapItem[]
  devs          ProductDev[]
  stacks        ProductStack[]
  environments  ProductEnvironment[]
}

model RoadmapItem {
  id            Int            @id @default(autoincrement())
  productId     Int
  title         String
  status        ActivityStatus @default(BACKLOG)
  plannedDate   DateTime?
  startDateAtividade DateTime?
  assigneeId    Int?
  completion    Int            @default(0)
  riskPoint     String?
}
```

## 7. Critérios de Aceite Técnicos
- **Latency**: Endpoints de leitura devem responder em < 200ms.
- **Security**: Autenticação via JWT e roteamento protegido por roles.
- **UX**: Gráfico de Gantt deve permitir edição rápida de datas diretamente na timeline.
- **Import**: Suporte a arquivos CSV com deduplicação baseada em ID.