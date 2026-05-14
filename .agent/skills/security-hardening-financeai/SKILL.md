# Skill — Security Hardening FinanceAI

## Objetivo

Melhorar a segurança do FinanceAI sem quebrar a arquitetura atual do projeto.

O projeto usa:

- Frontend React + Vite
- Backend Node.js + Express
- PostgreSQL + Prisma
- JWT para autenticação
- Modelo SaaS com Organization, User, Role, Category, Transaction e EntityRecord

Esta skill deve ser usada sempre que for implementar, revisar ou reforçar segurança no FinanceAI.

---

## Regras obrigatórias

1. Não alterar layout, nomes de telas ou experiência visual sem pedido explícito.
2. Não remover funcionalidades existentes.
3. Não expor senha, token, JWT, DATABASE_URL, stack trace ou dados financeiros em logs/respostas.
4. Toda rota privada deve usar `requireAuth`.
5. Toda consulta de dados financeiros deve filtrar por `organizationId` e, quando aplicável, por `userId`.
6. Nunca confiar em `organizationId`, `userId` ou `role` vindos do body/query do frontend.
7. O contexto de segurança deve vir sempre do JWT validado e do banco.
8. Qualquer mudança de segurança deve manter `npm run build` funcionando.
9. Qualquer mudança no backend deve manter `npm --prefix backend run prisma:generate` funcionando.
10. Em produção, falhas internas devem retornar mensagem genérica ao usuário.

---

## Contexto atual identificado

### Pontos já existentes

- Backend Express configurado em `backend/src/server.js`.
- Uso de `helmet`.
- Uso de `cors` com origem definida por `FRONTEND_URL`.
- Limite de JSON em `2mb`.
- Rate limit em `/api/auth/login` e `/api/auth/register`.
- JWT obrigatório com `JWT_SECRET`.
- Middleware `requireAuth` valida o token e busca o usuário atual no banco.
- Rotas de domínio usam `domainRoutes.use(requireAuth)`.
- Prisma usa PostgreSQL via `DATABASE_URL`.
- Senhas são armazenadas com bcrypt.

### Pontos que devem ser reforçados

- Exigir `JWT_SECRET` forte em produção.
- Exigir `FRONTEND_URL` em produção.
- Reduzir tempo de vida do access token ou preparar refresh token seguro.
- Melhorar política de CORS para não aceitar origem indefinida em produção.
- Adicionar validação Zod também em updates/parciais.
- Validar tamanho e formato de campos JSON em `EntityRecord`.
- Criar middleware de autorização por papel: OWNER, ADMIN, MEMBER.
- Criar testes de isolamento multi-tenant.
- Criar auditoria para ações sensíveis.
- Revisar headers de segurança/CSP.
- Evitar mensagens diferentes que facilitem enumeração de e-mail.

---

## Checklist de implementação

### 1. Segurança de ambiente

Criar ou ajustar validações de ambiente no backend:

- `DATABASE_URL` obrigatório.
- `JWT_SECRET` obrigatório.
- Em produção, `JWT_SECRET` deve ter pelo menos 32 caracteres.
- Em produção, `FRONTEND_URL` deve ser obrigatório.
- Em produção, bloquear `FRONTEND_URL=*` ou origem vazia.
- Garantir `NODE_ENV=production` no deploy.

Sugestão de arquivo:

- `backend/src/config/env.js`

Critérios de aceite:

- Backend não sobe em produção com segredo fraco.
- Backend não sobe em produção com CORS inseguro.
- Mensagem no console deve apontar a variável ausente, mas nunca imprimir o valor dela.

---

### 2. JWT e sessão

Revisar `backend/src/utils/jwt.js`:

- Manter assinatura com `JWT_SECRET`.
- Reduzir `expiresIn` de `7d` para algo menor, preferencialmente `2h` ou `4h`, se ainda não houver refresh token.
- Não colocar dados sensíveis no payload.
- Payload permitido: `sub`, `userId`, `email`, `organizationId`, `role`.
- Avaliar remoção de `name` do token, pois pode ser buscado pelo `/me`.

Critérios de aceite:

- Token expirado retorna 401.
- Token inválido retorna 401.
- Usuário removido do banco retorna 401.
- Alteração de role/organization no banco é refletida na próxima validação.

---

### 3. Autenticação e cadastro

Revisar login e register:

- Login deve retornar sempre mensagem genérica: `Credenciais inválidas.`
- Cadastro pode retornar conflito de e-mail, mas em produção avaliar mensagem genérica.
- Normalizar e-mail para lowercase/trim antes de salvar ou buscar.
- Validar força mínima da senha no Zod.
- Usar bcrypt com custo configurável por ambiente, mínimo 10.
- Nunca retornar `passwordHash`.

Critérios de aceite:

- E-mail `Teste@Email.com` e `teste@email.com` não criam contas duplicadas.
- Senha curta/fraca é recusada.
- Resposta de login nunca informa se o e-mail existe.

---

### 4. Rate limit e proteção contra força bruta

Manter rate limit existente e evoluir para:

- Login/register limitado por IP.
- Login também limitado por e-mail normalizado.
- Rota `/api/ai/analyze` com limite mais restritivo por usuário/plano.
- Retornar HTTP 429 com mensagem genérica.

Critérios de aceite:

- Tentativas repetidas recebem 429.
- Headers padrão de rate limit continuam ativos.
- Limite não quebra uso normal em desenvolvimento.

---

### 5. Autorização por papel

Criar middleware:

- `backend/src/middlewares/require-role.js`

Função esperada:

```js
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Acesso negado." });
    }
    return next();
  };
}
```

Usar quando existir rota administrativa ou ação restrita:

- OWNER pode gerenciar organização.
- ADMIN pode operar dados da organização.
- MEMBER tem acesso limitado.

Critérios de aceite:

- MEMBER não acessa rota de administração.
- ADMIN não altera dono da organização.
- OWNER mantém permissões máximas dentro da própria organização.

---

### 6. Isolamento multi-tenant

Revisar todos os services:

- Toda consulta precisa usar `organizationId` do contexto autenticado.
- Nunca aceitar `organizationId` vindo do frontend.
- Updates/deletes devem fazer `findFirst` com `id + organizationId` antes de alterar.
- Quando a regra for por usuário, também filtrar `userId`.

Áreas críticas:

- `Category`
- `Transaction`
- `EntityRecord`
- Dashboard
- Insights
- IA/análise

Critérios de aceite:

- Usuário de uma organização não lê dado de outra organização.
- Usuário de uma organização não altera/deleta dado de outra organização.
- Teste automatizado deve cobrir esse cenário.

---

### 7. Validação de entrada

Revisar validators Zod:

- Criar schemas separados para create e update.
- Updates devem aceitar parcial, mas validar tipo/tamanho dos campos enviados.
- IDs devem ser validados como string não vazia.
- Datas devem ser validadas antes de `new Date()`.
- Valores monetários devem ter limite mínimo/máximo.
- `payload` e `EntityRecord.data` devem ter limite de tamanho e chaves permitidas quando possível.

Critérios de aceite:

- Payload inválido retorna 400.
- Date inválida não salva `Invalid Date`.
- JSON gigante ou inesperado é recusado.

---

### 8. Headers e CORS

Revisar `helmet`:

- Manter `helmet()`.
- Avaliar CSP específica em produção.
- Desabilitar informações desnecessárias de framework.
- CORS deve aceitar somente `FRONTEND_URL`.
- Em produção, não aceitar ausência de origin sem decisão explícita.

Critérios de aceite:

- Requisição de origem não permitida é bloqueada.
- Frontend autorizado continua funcionando.
- Headers de segurança aparecem na resposta.

---

### 9. Logs seguros e tratamento de erro

Revisar `error-handler.js`:

- Não retornar stack trace em produção.
- Não retornar erro bruto do Prisma.
- Não logar body completo de login/register.
- Nunca logar senha, token, Authorization header ou DATABASE_URL.
- Criar helper para mascarar dados sensíveis.

Campos sensíveis:

- `password`
- `passwordHash`
- `token`
- `authorization`
- `cookie`
- `DATABASE_URL`
- `JWT_SECRET`

Critérios de aceite:

- Erro interno retorna HTTP 500 genérico.
- Log técnico fica no servidor sem segredo.
- Erro de validação retorna 400 com campos seguros.

---

### 10. Auditoria

Criar auditoria para ações sensíveis:

- Login com sucesso.
- Falha de login, sem expor senha.
- Criação/alteração/exclusão de transação.
- Criação/alteração/exclusão de categoria.
- Alteração de perfil, role ou organização.
- Chamadas de IA/análise.

Sugestão de tabela Prisma:

```prisma
model AuditLog {
  id             String   @id @default(cuid())
  userId         String?
  organizationId String?
  action         String
  entity         String?
  entityId       String?
  ip             String?
  userAgent      String?
  metadata       Json?
  createdAt      DateTime @default(now())

  @@index([organizationId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

Critérios de aceite:

- Auditoria não salva senha/token.
- Auditoria permite rastrear alterações financeiras.
- Falha na auditoria não deve derrubar a operação principal, exceto em ações críticas definidas.

---

### 11. Proteção de dados financeiros

Regras:

- Dados financeiros não devem ser enviados para IA externa sem consentimento explícito.
- Se houver integração externa, anonimizar ou reduzir dados.
- Não expor transações de outras organizações.
- Exportações futuras devem exigir autenticação e autorização.

Critérios de aceite:

- IA recebe somente dados necessários.
- Não há vazamento entre organizações.
- Respostas da API não incluem campos internos desnecessários.

---

### 12. Testes obrigatórios

Criar testes de segurança para:

- Login com senha inválida.
- Login com e-mail inexistente.
- Token ausente.
- Token inválido.
- Token expirado.
- Usuário removido após emissão do token.
- Acesso multi-tenant bloqueado.
- MEMBER bloqueado em rota OWNER/ADMIN.
- Payload inválido retorna 400.
- Rate limit retorna 429.
- CORS bloqueia origem indevida em produção.

Comandos mínimos:

```bash
npm install
npm --prefix backend install
npm --prefix backend run prisma:generate
npm run build
```

Se houver suíte de testes backend, rodar também:

```bash
npm --prefix backend test
```

---

## Prompt pronto para executar com agente

Use este prompt quando for pedir a implementação:

```text
Leia o repositório FinanceAI e aplique hardening de segurança seguindo .agent/skills/security-hardening-financeai/SKILL.md.

Regras:
- Não alterar layout.
- Não quebrar funcionalidades existentes.
- Não remover rotas existentes.
- Não expor segredos em logs/respostas.
- Toda rota privada deve continuar exigindo JWT.
- Toda consulta financeira deve respeitar organizationId do usuário autenticado.

Prioridade de implementação:
1. Criar validação centralizada de env em backend/src/config/env.js.
2. Reforçar JWT e CORS para produção.
3. Criar middleware requireRole.
4. Revisar validações Zod de create/update.
5. Melhorar error-handler para produção e logs seguros.
6. Criar testes de auth, autorização e isolamento multi-tenant.
7. Rodar npm --prefix backend run prisma:generate e npm run build.

Entregue:
- Arquivos alterados.
- O que foi reforçado.
- Como testar.
- Resultado dos comandos executados.
```

---

## Entrega esperada do agente

Ao finalizar, o agente deve responder com:

- Resumo das alterações.
- Lista de arquivos criados/alterados.
- Riscos corrigidos.
- Riscos pendentes.
- Comandos executados.
- Resultado do build/testes.

Não considerar a tarefa concluída se o build falhar.
