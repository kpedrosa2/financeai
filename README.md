# FinanceAI — Fullstack local (React + Node + PostgreSQL + Prisma)

Aplicação financeira com frontend Vite/React, backend Express, autenticação JWT, dashboard consolidado, insights baseados em regras e modelo SaaS multiusuário (organização + papéis).

## Requisitos

- Node.js 20+
- npm
- PostgreSQL 16+ (porta padrão **5432**) acessível pela `DATABASE_URL`

## 1. Dependências

Na raiz do repositório:

```bash
npm install
npm --prefix backend install
```

## 2. PostgreSQL local

Crie um banco (ex.: `financeai`) e um usuário com permissão de escrita.

Exemplo rápido com Docker:

```bash
docker run -d --name financeai-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=financeai \
  -p 5432:5432 \
  postgres:16-alpine
```

`DATABASE_URL` sugerida:

`postgresql://postgres:postgres@localhost:5432/financeai?schema=public`

## 3. Backend — `backend/.env`

```bash
cp backend/.env.example backend/.env
```

Variáveis obrigatórias:

- `DATABASE_URL` — conexão PostgreSQL
- `JWT_SECRET` — chave forte em produção

Opcional:

- `PORT` (padrão **3001**)
- `FRONTEND_URL` (padrão **http://localhost:5173**) — CORS restrito a esta origem

## 4. Migrations e seed

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
```

O seed cria:

| Campo   | Valor                 |
|--------|------------------------|
| E-mail | `demo@financeai.local` |
| Senha  | `demo123456`           |
| Org    | Demo FinanceAI         |

## 5. Frontend — `.env`

```bash
cp .env.example .env
```

Defina `VITE_API_URL=http://localhost:3001/api` (já é o padrão no exemplo).

## 6. Executar

Somente backend:

```bash
npm run dev:backend
```

Somente frontend (**http://localhost:5173**):

```bash
npm run dev
```

Tudo junto:

```bash
npm run dev:full
```

### Validação sugerida (`commands.md`)

```bash
npm install
npm --prefix backend install
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:migrate
npm --prefix backend run prisma:seed
npm run build
npm run dev:full
```

## 7. Rotas principais da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Status + teste de conexão com o banco |
| POST | `/api/auth/register` | Cadastro (cria organização + papel OWNER) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuário atual (JWT) |
| GET | `/api/dashboard` | Resumo, evolução mensal, despesas por categoria, transações recentes |
| GET | `/api/insights` | Insights financeiros locais (regras) |
| CRUD | `/api/categories`, `/api/transactions` | Domínio autenticado |
| CRUD | `/api/entities/:entity` | Compatibilidade com telas legadas (metadados extras) |

O JWT inclui `userId`, `organizationId`, `role` e o middleware valida sempre o estado atual do usuário no banco para evitar inconsistências.

## 8. Arquitetura (visão rápida)

- **Frontend** — Rotas React, dados via `fetch` em `src/services/api.js`; compatível com uso legado de `src/api/base44Client.js` (somente nomenclatura, sem Base44).
- **Backend** — Express em camadas (`routes` → `controllers` → `services`), validação Zod onde aplicável, rate limit em login/register.
- **Banco** — PostgreSQL via Prisma: `User`, `Organization`, `Category`, `Transaction`, `EntityRecord`.
- **Dashboard** — Aggregações por usuário e organização em `dashboardService.js`.
- **Insights** — Regras determinísticas em `insightService.js` (sem API externa de IA nesta camada).

## 9. Como testar manualmente

1. Subir PostgreSQL e aplicar migrations + seed.
2. `npm run dev:full`
3. Acessar `http://localhost:5173/login`
4. Entrar com `demo@financeai.local` / `demo123456`
5. Confirmar Dashboard (cards + gráficos + insights), CRUD em Transações e persistência no banco (`prisma studio` opcional).

## 10. Pendências conhecidas

- Fluxos Base44-only (upload de extrato via integração, etc.) seguem usando stubs onde não há substituto local.
- Opcionalmente, evoluir as integrações de IA real (OpenAI/DeepSeek) consumindo payloads padronizados dos insights/dashboard.
