# Deployment Guide - TCG Store Manager

## Pré-Deploy Checklist

- [ ] Todos os testes locais passando
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção funcionando
- [ ] Sem erros de TypeScript/ESLint

## Deploy na Vercel

### 1. Instalar Vercel CLI (se não tiver)

```bash
npm install -g vercel
```

### 2. Login na Vercel

```bash
vercel login
```

### 3. Configurar Projeto

```bash
vercel
```

Siga o wizard:
- **Set up and deploy?** Yes
- **Which scope?** Sua conta/organização
- **Link to existing project?** No (primeira vez) ou Yes (deploys subsequentes)
- **Project name?** tcg-store-manager
- **Directory?** ./
- **Override settings?** No

### 4. Configurar Variáveis de Ambiente

No dashboard da Vercel:
1. Ir para **Settings** → **Environment Variables**
2. Adicionar:
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-anon-key`
3. Selecionar ambientes: Production, Preview, Development

### 5. Deploy para Produção

```bash
vercel --prod
```

### 6. Verificar Deploy

Após deploy, a Vercel fornecerá uma URL:
```
https://tcg-store-manager.vercel.app
```

Testar:
1. **Health Check**: `https://your-app.vercel.app/health`
2. **Autenticação**: Fazer login na aplicação
3. **CRUD**: Testar operações de players/products/events

## Configuração de Domínio Customizado (Opcional)

### 1. Adicionar Domínio

No dashboard da Vercel:
1. **Settings** → **Domains**
2. Adicionar seu domínio (ex: `tcgstore.com`)

### 2. Configurar DNS

No seu provedor de DNS:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### 3. Aguardar Propagação

Pode levar até 48h, mas geralmente é instantâneo.

## Monitoramento

### 1. Logs

Ver logs em tempo real:
```bash
vercel logs
```

Ou no dashboard: **Deployments** → Selecionar deploy → **Logs**

### 2. Analytics

Dashboard da Vercel → **Analytics**:
- Visualizações de página
- Latência de Edge Functions
- Erros 4xx/5xx

### 3. Alertas

Configurar alertas para:
- Erros 5xx acima de threshold
- Latência alta
- Downtime

## Rollback

Se houver problemas:

### 1. Via Dashboard

1. **Deployments**
2. Selecionar deploy anterior estável
3. **Promote to Production**

### 2. Via CLI

```bash
vercel rollback
```

## CI/CD Automático

### GitHub Integration

1. Conectar repositório GitHub à Vercel
2. Cada push para `main` → Deploy automático para produção
3. Cada PR → Deploy de preview

### Configuração

No dashboard:
1. **Settings** → **Git**
2. Conectar repositório
3. Configurar branch de produção: `main`

## Troubleshooting

### Erro: "Build failed"

**Solução**:
1. Verificar logs de build
2. Testar build localmente: `npm run build`
3. Corrigir erros de TypeScript/ESLint

### Erro: "Function timeout"

**Solução**:
- Edge Functions têm timeout de 30s
- Otimizar queries lentas
- Adicionar índices no Supabase

### Erro: "Environment variables not found"

**Solução**:
1. Verificar que variáveis estão configuradas
2. Fazer redeploy: `vercel --prod`

## Performance Optimization

### 1. Caching

Adicionar headers de cache em `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/api/players",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "s-maxage=60, stale-while-revalidate"
        }
      ]
    }
  ]
}
```

### 2. Compression

Vercel automaticamente comprime respostas com gzip/brotli.

### 3. Image Optimization

Usar `next/image` ou Vercel Image Optimization para imagens.

## Segurança

### 1. Rate Limiting

Implementar rate limiting nas Edge Functions:
```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

### 2. CORS

Já configurado em `vercel.json`, mas pode restringir origins:
```json
{
  "headers": [
    {
      "key": "Access-Control-Allow-Origin",
      "value": "https://your-domain.com"
    }
  ]
}
```

### 3. Secrets

Nunca commitar secrets no código. Sempre usar variáveis de ambiente.

## Custos

### Vercel Pricing

- **Hobby (Free)**:
  - 100 GB bandwidth/mês
  - Edge Functions ilimitadas
  - Perfeito para desenvolvimento

- **Pro ($20/mês)**:
  - 1 TB bandwidth/mês
  - Analytics avançado
  - Recomendado para produção

### Supabase Pricing

- **Free**:
  - 500 MB database
  - 1 GB file storage
  - 50k MAU (Monthly Active Users)

- **Pro ($25/mês)**:
  - 8 GB database
  - 100 GB file storage
  - 100k MAU

## Próximos Passos

Após deploy bem-sucedido:

1. ✅ Configurar domínio customizado
2. ✅ Configurar CI/CD com GitHub
3. ✅ Implementar monitoramento
4. ✅ Configurar alertas
5. ✅ Otimizar performance
6. ✅ Implementar Fase 3 (AI Features)
