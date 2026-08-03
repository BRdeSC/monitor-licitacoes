# 🛡️ Monitor de Licitações Públicas - SaaS Multi-Tenant (MVP Fechado)

Sistema web resiliente, seguro e de alta performance para monitoramento automatizado de licitações públicas consumindo dados da API oficial do **PNCP (Portal Nacional de Contratações Públicas)**. 

---

## 🎯 Principais Recursos

- **Isolamento Multi-tenant Rigoroso**: Coluna `tenant_id` em todas as tabelas sensíveis com `Cross-Tenant Shield` nos middlewares da API REST.
- **Filtro Inteligente Por Inquilino**:
  - **Palavras-Chave Positivas**: Captura oportunidades alinhadas ao nicho do cliente (ex: *água mineral, gás GLP, software*).
  - **Filtro Negativo de Exclusão**: Descarta editais com termos indesejados (ex: *locação, manutenção, medicinal*).
  - **Filtro Geográfico (UF)**: Restringe alertas a estados de interesse.
- **Robô de Ingestão Resiliente (Worker Node-Cron)**: Coleta assíncrona, normalização de DTOs e salvamento deduplicado via `numeroControlePNCP`.
- **Funil de Oportunidades Privado**: Visualização com estatísticas em tempo real e alteração de status (`Nova`, `Em Análise`, `Salva`, `Descartada`).
- **Strict LGPD Compliance**: Audit Logs imutáveis (`AuditLog`), minimização de dados e suporte ao *Direito ao Esquecimento* (`DELETE /api/lgpd/forget/:tenantId`).
- **Segurança OWASP Top 10**: Autenticação JWT via HTTPOnly Secure Cookies, senhas em BCrypt, rate-limiting contra ataques de força bruta e cabeçalhos HTTP via Helmet.

---

## 🏛️ Arquitetura de Implantação

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (Vercel)                                 |
|                       Next.js 16 (App Router + TailwindCSS)                       |
|                    Dashboard Privado Sem Rota Pública de Cadastro                 |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS / REST (Cookies HTTPOnly)
                                          v
+-----------------------------------------------------------------------------------+
|                                  BACKEND (AWS EC2 / Docker)                       |
|                Node.js (TypeScript) + Express/Fastify + Helmet + Cron             |
+-----------------------------------------+-----------------------------------------+
                                          | Prisma ORM
                                          v
+-----------------------------------------------------------------------------------+
|                                BANCO DE DADOS (PostgreSQL EC2)                    |
|       Tabelas: Tenant, User, TermoInteresse, TermoExclusao, Licitacao,             |
|                LicitacaoMatch, AuditLog, WorkerLog                                |
+-----------------------------------------------------------------------------------+
```

---

## 📁 Estrutura do Monorepo

```
monitor-licitacoes/
├── apps/
│   ├── api/                       # REST API Backend + Background Worker
│   │   ├── src/
│   │   │   ├── config/            # Envs (.env), cors, helmet
│   │   │   ├── middlewares/       # Auth JWT, tenantId shield, audit, rateLimit
│   │   │   ├── controllers/       # Auth, Termos, Licitações, Health, LGPD
│   │   │   ├── services/          # Negócio, Match Engine, LGPD Purge
│   │   │   ├── worker/            # PNCP Client (v1/contratacoes) & Cron Scheduler
│   │   │   ├── routes/            # Definição das rotas REST
│   │   │   └── server.ts          # Server Express + Cron Bootstrap
│   │   ├── Dockerfile
│   │   └── package.json
│   └── web/                       # Frontend Next.js 16 (App Router)
│       ├── app/
│       │   ├── (auth)/login/      # Tela de Login Privada
│       │   ├── (dashboard)/       # Funil, Configurações, Audit Logs LGPD
│       │   └── layout.tsx
│       ├── components/            # LicitacaoCard, CountdownTimer, Sidebar, Header
│       └── package.json
├── prisma/
│   ├── schema.prisma              # Schema Multi-Tenant completo
│   └── seed.ts                    # Script de popular Tenant & Admin inicial
├── docker-compose.yml             # Setup local PostgreSQL 16
└── README.md
```

---

## 🚀 Como Executar o Projeto Localmente

### 1. Clonar e Instalar Dependências

```bash
git clone <URL_DO_REPOSITORIO>
cd monitor-licitacoes
npm install
```

### 2. Subir o Banco de Dados PostgreSQL via Docker

```bash
docker-compose up -d
```

### 3. Configurar Variáveis de Ambiente e Gerar Migrations Prisma

```bash
cp .env.example .env

# Sincroniza o schema do Prisma com o banco de dados
npx prisma db push

# Popula o banco com um Tenant e Admin de testes (admin@empresa.com.br / admin123)
npx prisma db seed
```

### 4. Iniciar o Backend API e Worker Agendado

```bash
cd apps/api
npm run dev
```
A API estará rodando em `http://localhost:4000`. O healthcheck pode ser verificado em `http://localhost:4000/api/health`.

### 5. Iniciar o Frontend Next.js

Em outro terminal:

```bash
cd apps/web
npm run dev
```
Acesse `http://localhost:3000/login` e faça login com:
- **E-mail**: `admin@empresa.com.br`
- **Senha**: `admin123`

---

## 🔒 Endpoints Principais da API REST

| Método | Endpoint | Protegido | Descrição |
|---|---|---|---|
| `GET` | `/api/health` | Não | Check do status da API e conexão com o Postgres |
| `POST` | `/api/auth/login` | Não (Rate-limited) | Autenticação com Cookie HTTPOnly JWT |
| `POST` | `/api/auth/logout` | Sim | Encerra a sessão e limpa os cookies |
| `GET` | `/api/auth/me` | Sim | Retorna dados do usuário e Tenant logado |
| `GET` | `/api/licitacoes/matches` | Sim (Tenant Shield) | Lista licitações combinadas para o tenant |
| `PATCH` | `/api/licitacoes/matches/:id/status` | Sim (Tenant Shield) | Altera status no funil (`NOVA`, `EM_ANALISE`, `SALVA`, `DESCARTADA`) |
| `GET` | `/api/termos/interesse` | Sim (Tenant Shield) | Lista palavras-chave positivas do tenant |
| `POST` | `/api/termos/interesse` | Sim (Tenant Shield) | Cadastra nova palavra de interesse |
| `POST` | `/api/termos/exclusao` | Sim (Tenant Shield) | Cadastra nova palavra de exclusão negativa |
| `GET` | `/api/lgpd/audit-logs` | Sim (Tenant Shield) | Visualiza logs de auditoria LGPD do tenant |
| `DELETE` | `/api/lgpd/forget/:tenantId` | Super Admin | **Direito ao Esquecimento**: Expurgador em cascata de dados |

---

## 🛠️ Licença

Este projeto é um software proprietário fechado (MVP Multi-tenant). Todos os direitos reservados.
