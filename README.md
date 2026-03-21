# 📦 ProductSQUAD Manager

> Sistema centralizado para gestão de Catálogo de Produtos, Roadmaps de Evolução e Sustentação Técnica.

O **ProductSQUAD Manager** foi concebido para ser a "Single Source of Truth" de um ecossistema de produtos digitais. Ele permite que líderes de produto (POs/PMs), Tech Leads e Squads tenham uma visão clara da saúde técnica, roadmap de evolução e dependências de cada produto da companhia.

---

## 🎯 Propósito do Sistema

O objetivo principal é eliminar documentos esparsos e planilhas de controle, consolidando:

1.  **Visibilidade Técnica**: Quais tecnologias (Stack) cada produto utiliza em cada ambiente.
2.  **Gestão de Sustentação**: Quem são os desenvolvedores alocados e quem responde tecnicamente (Head/Tech Lead).
3.  **Transparência de Roadmap**: Evolução das atividades via Kanban, com indicadores de % de conclusão e gestão de pontos de risco.
4.  **Integração com Clientes**: Registro de quais outras aplicações ou squads consomem o produto e quais são suas sugestões de melhoria.
5.  **Centralização de Infraestrutura**: Acesso rápido a links de monitoramento (Grafana, Datadog), orquestração (ArgoCD) e logs das aplicações.

---

## 🚀 Como Iniciar (Setup Local)

### 📋 Pré-requisitos
*   **Node.js** v18 ou superior.
*   **Git** instalado.
*   **Supabase** (ou qualquer instância PostgreSQL).

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
*   `DATABASE_URL`: URL de conexão do PostgreSQL (ver seção Supabase abaixo).
*   `JWT_SECRET`: Uma chave aleatória para segurança dos tokens.
*   `GOOGLE_CLIENT_ID` / `SECRET`: Credenciais para login via Google (opcional para dev-login).

### 3. Configuração do Supabase (Banco de Dados)
Este projeto utiliza o **Supabase** como persistência de dados.
1.  Crie um projeto no [Supabase Console](https://supabase.com).
2.  Em **Project Settings -> Database**, copie a **Connection String** (Transaction mode).
3.  Cole no campo `DATABASE_URL` do seu `.env`.
4.  Execute as migrações para criar as tabelas:
```bash
npx prisma migrate dev
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
*   Frontend: [http://localhost:3000](http://localhost:3000)
*   API: [http://localhost:3001](http://localhost:3001)

---

## 🛠️ Stack Tecnológica

*   **Frontend**: React 18, Tailwind CSS (Alta Densidade Visual), Lucide React.
*   **Backend**: Node.js, Express, Prisma ORM.
*   **Banco de Dados**: PostgreSQL (Via Supabase).
*   **Gestão**: Turborepo, TypeScript.

---

## 🔄 Fluxo de Desenvolvimento e Git

Sempre que realizar alterações:
1.  Verifique a integridade do banco: `npx prisma generate`.
2.  Faça o commit das alterações:
```bash
git add .
git commit -m "feat: descrição da nova funcionalidade"
git push origin main
```
