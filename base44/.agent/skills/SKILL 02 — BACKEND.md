# SKILL — FINANCEAI 02: BACKEND

Objetivo:
Criar backend completo substituindo Base44.

Regras obrigatórias:
- API REST
- JWT authentication
- Middleware de segurança
- Estrutura em camadas

Estrutura:

src/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── utils/
└── server.js

Endpoints obrigatórios:

Auth:
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Categorias:
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id

Transações:
GET    /api/transactions
POST   /api/transactions
PATCH  /api/transactions/:id
DELETE /api/transactions/:id

Regras:
- Todas rotas protegidas com JWT (exceto login/register)
- Validar input
- Não permitir acesso a dados de outro usuário

Resultado esperado:
Backend funcional substituindo completamente Base44.