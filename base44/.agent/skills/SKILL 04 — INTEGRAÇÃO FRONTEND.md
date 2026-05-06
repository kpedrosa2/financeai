# SKILL — FINANCEAI 04: FRONTEND INTEGRATION

Objetivo:
Remover Base44 e integrar frontend ao backend local.

Ações obrigatórias:

1. Encontrar chamadas Base44:
- base44
- entities
- integrations

2. Substituir por fetch API:

Exemplo:

ANTES:
base44.entities.transactions.list()

DEPOIS:
fetch("http://localhost:3001/api/transactions")

3. Criar camada de API:

src/services/api.js

4. Criar auth storage:
- salvar JWT no localStorage

Regras:
- NÃO alterar layout
- NÃO quebrar telas
- Manter UX igual

Resultado esperado:
Frontend consumindo API local.