# TCG Store Manager - Guia de Testes Locais

## Pré-requisitos

1. **Variáveis de Ambiente**
   - Copie `.env.example` para `.env.local`
   - Preencha com suas credenciais do Supabase

2. **Dependências**
   ```bash
   npm install
   ```

## Testando Edge Functions Localmente

### 1. Iniciar Vercel Dev

```bash
npx vercel dev
```

Isso irá:
- Simular o ambiente Edge da Vercel
- Rodar as Edge Functions em `http://localhost:3000`
- Hot reload automático

### 2. Testar Health Check

```bash
curl http://localhost:3000/health
```

**Resposta Esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-27T03:41:00.000Z",
  "version": "2.0.0-edge"
}
```

### 3. Testar Autenticação (401)

```bash
curl http://localhost:3000/api/players
```

**Resposta Esperada**:
```json
{
  "error": "Unauthorized - Missing or invalid token"
}
```

### 4. Testar com Token

Primeiro, faça login na aplicação e copie o token do localStorage:

```javascript
// No DevTools Console
localStorage.getItem('supabase.auth.token')
```

Depois, teste com o token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/players
```

**Resposta Esperada**: Lista de players

### 5. Testar CRUD Completo

**Criar Player**:
```bash
curl -X POST http://localhost:3000/api/players \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-123",
    "name": "Teste Player",
    "balance": 100,
    "email": "test@example.com"
  }'
```

**Atualizar Player**:
```bash
curl -X PUT http://localhost:3000/api/players/test-123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Player Updated",
    "balance": 150
  }'
```

**Deletar Player**:
```bash
curl -X DELETE http://localhost:3000/api/players/test-123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Testar Finalização de Evento

```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/finalize \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testando Aplicação React

### 1. Iniciar Dev Server

Em outro terminal:

```bash
npm run dev
```

### 2. Verificar Integração

1. Abrir `http://localhost:5173`
2. Fazer login
3. Navegar para Players/Products/Events
4. Verificar que dados são carregados
5. Testar operações CRUD

### 3. Verificar Network Tab

No DevTools → Network:
- Verificar que requisições vão para `/api/*`
- Verificar header `Authorization: Bearer ...`
- Verificar status 200 para requisições autenticadas

## Troubleshooting

### Erro: "Missing Supabase credentials"

**Solução**: Verificar `.env.local`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Erro: "Invalid token"

**Solução**: 
1. Fazer logout e login novamente
2. Verificar que token está sendo enviado
3. Verificar que Supabase URL/Key estão corretos

### Erro: "CORS"

**Solução**: Verificar `vercel.json` tem configuração CORS:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

## Próximos Passos

Após testes locais bem-sucedidos:

1. ✅ Commit das mudanças
2. ✅ Push para repositório
3. ✅ Deploy na Vercel
4. ✅ Testar em produção
