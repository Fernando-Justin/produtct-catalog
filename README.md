# Product Catalog

Sistema de gerenciamento de produtos, aplicações e roadmap com gestão de squads, devs e clientes.

---

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Autenticação**: Google OAuth 2.0 + JWT
- **Monorepo**: Turborepo

---

## Estrutura

```
product-catalog/
├── apps/
│   ├── web/          # Frontend React (porta 3000)
│   └── api/          # Backend Express (porta 3001)
└── packages/
    └── shared/       # Tipos TypeScript compartilhados
```

---

## Funcionalidades

### 📦 Catálogo de Produtos
- Cadastro com descrição, propósito e observações
- Link de documentação no Confluence
- Status: Homologação / Produção / Descontinuado
- Vínculo com Squad responsável

### 🖥️ Aplicações (Apps)
- Apps vinculadas a cada produto
- Status por app (Homologação / Produção)
- Ambientes com links: Cluster, Logs, ArgoCD, Datadog, Grafana

### 🛠️ Stack Tecnológica
- Java, Go, Python, React, Node.js e Outros
- Definição por ambiente (Homologação / Produção / Ambos)

### 👥 Devs e Sustentação
- Lista de devs por produto
- Identificação de Tech Lead
- Perfil com cargo e squad

### 🤝 Clientes
- Nome da aplicação cliente / squad de contato
- Descritivo de uso
- Lista de sugestões de evolução e integração

### 🌐 Ambientes de Infraestrutura
- Links de Cluster, Logs, ArgoCD, Datadog, Grafana
- Separado por Homologação e Produção

### 🗺️ Roadmap
- Nome, descrição e indicador de meta
- Data prevista e esforço (PP / P / M / G / GG)
- Status: Backlog / In Progress / Blocked / Done
- Responsável (dev assignee)
- ID/identificador da atividade
- Atualização de status inline

### 📊 Dashboard
- Totalizadores: Produtos, Apps, Devs, Clientes
- Gráficos: Status das atividades, Esforço por atividade, Tecnologias mais usadas

### 🏢 Cadastros de Apoio
- Squads (nome, descrição, status)
- Usuários (vinculação com cargo e squad)
- Cargos (PO, Dev, Squad Lead, Admin, Viewer)

---

## Setup

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Conta Google Cloud (para OAuth)

### 1. Clone e instale dependências

```bash
git clone <repo>
cd product-catalog
npm install
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/product_catalog"
GOOGLE_CLIENT_ID=seu_client_id
GOOGLE_CLIENT_SECRET=seu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
JWT_SECRET=uma_chave_secreta_segura
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### 3. Configure o Google OAuth

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie ou selecione um projeto
3. Vá em **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth 2.0**
4. Tipo: **Aplicativo Web**
5. Origens autorizadas: `http://localhost:3000`
6. URIs de redirecionamento: `http://localhost:3001/api/auth/google/callback`
7. Copie o Client ID e Secret para o `.env`

### 4. Configure o banco de dados

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Configure o VITE_API_URL no frontend

Crie `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 6. Inicie em desenvolvimento

Na raiz do projeto:
```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Modelos de Dados

### Principais entidades:
- **Product** → Squad, Stacks, Apps, Devs, Clients, Environments, Links, RoadmapItems
- **App** → Stacks, Environments, Links
- **RoadmapItem** → Product, Assignee (User)
- **Client** → Product, Suggestions
- **User** → Role, Squad
- **Squad** → Users, Products

---

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/auth/google | Iniciar login Google |
| GET | /api/auth/me | Usuário autenticado |
| GET | /api/dashboard/stats | Estatísticas do dashboard |
| GET | /api/products | Listar produtos |
| POST | /api/products | Criar produto |
| GET | /api/products/:id | Detalhe do produto |
| PUT | /api/products/:id | Atualizar produto |
| DELETE | /api/products/:id | Excluir produto |
| GET | /api/products/:id/roadmap | Roadmap do produto |
| GET | /api/roadmap | Todos os itens de roadmap |
| POST | /api/roadmap | Criar atividade |
| PUT | /api/roadmap/:id | Atualizar atividade |
| GET | /api/squads | Listar squads |
| GET | /api/users | Listar usuários |
| GET | /api/roles | Listar cargos |
