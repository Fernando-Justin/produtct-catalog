# 📦 ProductSQUAD Manager

> Single Source of Truth para gestão de Catálogo de Produtos, Roadmaps (Gantt/Kanban) e Sustentação Técnica.

O **ProductSQUAD Manager** é uma plataforma centralizada projetada para eliminar a fragmentação de informações e silos de dados. Utilizando a metodologia **SDD (Spec-Driven Development)**, ele oferece uma "Single Source of Truth" para líderes de produto (POs/PMs), Tech Leads e Squads, garantindo visibilidade total sobre a saúde técnica, evolução de roadmaps e dependências de cada produto.

---

## 🎯 Propósito do Sistema

O objetivo principal é eliminar documentos esparsos e planilhas de controle, consolidando:

1.  **Visibilidade Técnica**: Quais tecnologias (Stack) cada produto utiliza em cada ambiente.
2.  **Gestão de Sustentação**: Quem são os desenvolvedores alocados e quem responde tecnicamente (Head/Tech Lead).
3.  **Transparência de Delivery**: Evolução das entregas via Kanban, com indicadores de % de conclusão e gestão de pontos de risco.
4.  **Integração com Clientes**: Registro de quais outras aplicações ou squads consomem o produto e quais são suas sugestões de melhoria.
5.  **Roadmap e Gestão à Vista**: Visualização interativa via Gráfico de Gantt anual com foco automático na data atual e alinhamento dinâmico de responsáveis.
6.  **Centralização de Infraestrutura**: Acesso rápido a links de monitoramento (Grafana, Datadog), orquestração (ArgoCD) e logs.

---

## 🏗️ Arquitetura

O sistema foi projetado como um **Monorepo** utilizando **Turborepo** para gerenciar as aplicações `web` (Frontend) e `api` (Backend) em un único repositório, garantindo consistência de tipos (End-to-end type safety) e compartilhamento de configurações.

---

## 🚀 Como Iniciar (Setup Local)

### 📋 Pré-requisitos

- **Node.js** v18 ou superior e **npm**.
- **TypeScript** para segurança de tipos.
- **Git** instalado.
- **Supabase** (ou qualquer instância PostgreSQL).

### 1. Clonar o Repositório

```bash
git clone https://github.com/Fernando-Justin/produtct-catalog.git
cd produtct-catalog
npm install
```

### 2. Configuração do Backend (apps/api)

Navegue até a pasta da API e configure o ambiente:

```bash
cd apps/api
cp .env.example .env
```

Edite o arquivo `.env` com as seguintes chaves essenciais:

- `DATABASE_URL`: URL de conexão do PostgreSQL (ver seção Supabase abaixo).
- `JWT_SECRET`: Uma chave aleatória para segurança dos tokens.
- `GOOGLE_CLIENT_ID` / `SECRET`: Credenciais para login via Google (opcional para dev-login).

### 3. Configuração do Supabase (Banco de Dados)

Este projeto utiliza o **Supabase** como persistência de dados.

1.  Crie um projeto no [Supabase Console](https://supabase.com).
2.  Em **Project Settings -> Database**, copie a **Connection String** (Transaction mode).
3.  Cole no campo `DATABASE_URL` do seu `.env`.
4.  Sincronize o banco de dados:
    - Se o banco estiver vazio: `npm run db:migrate`
    - Se já houver dados no Supabase: `npm run db:pull`

```bash
npx prisma generate
```

### 4. Configuração do Frontend (apps/web)

Certifique-se de que o frontend sabe onde a API está rodando:

```bash
cd apps/web
# O arquivo .env deve conter:
# VITE_API_URL=http://localhost:3001
```

### 5. Rodar o Projeto

Na raiz do repositório, utilize o Turborepo para subir tudo simultaneamente:

```bash
npm run dev
```

O sistema estará disponível em:

- Frontend: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)

---

## 🔒 Segurança e Permissões (RBAC)

O backend valida tokens **JWT** em todas as requisições protegidas. O sistema implementa controle de acesso baseado em funções:

- **ADMIN / TECH_LEAD**: Permissão total para edição de squads, roles e configurações críticas.
- **USER / GUEST**: Acesso de visualização e interações básicas conforme a squad vinculada.

---

## ️ Stack Tecnológica

- **Frontend**: React 18, Tailwind CSS (Alta Densidade Visual), Lucide React.
- **Backend**: Node.js, Express, Prisma ORM.
- **Banco de Dados**: PostgreSQL (Hospedado via Supabase).
- **Gestão**: Turborepo, TypeScript (End-to-end type safety).

---

## 🔄 Fluxo de Desenvolvimento e Git

1.  **Importação de Dados**: Suporta carga massiva via **CSV** com lógica de **deduplicação baseada em ID (Upsert)**, evitando duplicidade ao re-importar planilhas atualizadas.

Sempre que realizar alterações:

1.  Verifique a integridade do banco: `npx prisma generate`.
2.  Faça o commit das alterações:

```bash
git add .
git commit -m "feat: descrição da nova funcionalidade"
git push origin main
```
