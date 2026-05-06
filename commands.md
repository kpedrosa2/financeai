# FINANCEAI — REMOVER NOMES BASE44 E PREPARAR PUSH

Objetivo:
Remover qualquer menção ao nome Base44 em arquivos, pastas, nomes de variáveis, package name, documentação e compatibilidade visual do projeto.

Contexto:
O projeto foi migrado para arquitetura local:
- React/Vite
- Node/Express
- PostgreSQL
- Prisma
- JWT
- Dashboard
- Insights
- IA local
- SaaS base

Regras:
- Não quebrar funcionalidades existentes.
- Não alterar layout sem necessidade.
- Não remover a camada de compatibilidade se ela ainda for usada; apenas renomear para nomes próprios do FinanceAI.
- Não usar Base44 em nenhum lugar.
- Manter frontend e backend funcionando.
- Atualizar imports após renomear arquivos.
- Atualizar README.
- Rodar build ao final.

Tarefas:

1. Procurar qualquer ocorrência:
- base44
- Base44
- BASE44
- base44Client
- base44-app

2. Renomear package name no package.json:
De:
base44-app
Para:
financeai

3. Renomear arquivo:
src/api/base44Client.js
Para:
src/api/financeaiClient.js

4. Atualizar todos os imports que apontavam para:
src/api/base44Client.js

Para:
src/api/financeaiClient.js

5. Dentro do arquivo renomeado:
- remover comentários com Base44
- trocar nomes de funções/variáveis se houver referência direta
- manter a mesma API pública se necessário para não quebrar telas

6. Remover menções do README.md:
Trocar qualquer referência a Base44 por:
- FinanceAI local API
- backend próprio
- arquitetura local

7. Verificar nomes de pastas/arquivos:
Se houver qualquer pasta ou arquivo com base44 no nome, renomear para financeai.

8. Validar:
Executar:
npm install
npm --prefix backend install
npm --prefix backend run prisma:generate
npm run build

9. Entregar resumo:
- Arquivos renomeados
- Imports atualizados
- Menções removidas
- Resultado do build