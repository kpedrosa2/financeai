# SKILL — FINANCEAI 03: BANCO

Objetivo:
Criar banco PostgreSQL local com Prisma.

Modelos obrigatórios:

User:
- id
- name
- email (unique)
- passwordHash
- createdAt

Category:
- id
- name
- type (income | expense)
- userId
- createdAt

Transaction:
- id
- description
- amount
- type
- date
- userId
- categoryId
- createdAt

Regras:
- Relacionamento correto entre tabelas
- Cascade controlado
- Index em userId

Comandos obrigatórios:
- npx prisma init
- npx prisma migrate dev

Resultado esperado:
Banco local funcional com dados persistidos.