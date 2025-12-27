# POS/Checkout Logic Documentation

## Overview

O sistema de Point-of-Sale (POS) do TCG Store Manager implementa uma lógica sofisticada de checkout que diferencia entre produtos e eventos, aplicando regras específicas de pagamento para cada categoria.

## Fluxo de Checkout

### 1. Seleção de Cliente (Step: 'select-player')

- Usuário busca e seleciona um jogador
- Exibe saldo atual do jogador
- Transição automática para seleção de produtos

### 2. Seleção de Produtos (Step: 'select-products')

- Busca de produtos no catálogo
- Opção de adicionar "Gasto Avulso" (itens customizados)
- Validação de estoque em tempo real
- Adicionar produtos ao carrinho

### 3. Revisão do Carrinho (Step: 'review')

- Visualização de todos os itens
- Ajuste de quantidades
- Remoção de itens
- Opção de salvar itens customizados como produtos permanentes
- Confirmação de venda

## Separação Inteligente de Itens

### Critérios de Identificação de Eventos

Um item é considerado "Evento/Torneio" se atender a **qualquer** dos seguintes critérios:

```typescript
const isEventItem = (item: CartItem) =>
  item.category === 'Event' ||
  item.category === 'Torneio' ||
  item.category === 'Inscrição' ||
  item.name.toLowerCase().includes('torneio') ||
  item.name.toLowerCase().includes('evento') ||
  item.name.toLowerCase().includes('inscrição') ||
  item.name.toLowerCase().includes('campeonato');
```

### Categorização

- **Produtos**: Cards, Sleeves, Acessórios, etc.
- **Eventos**: Torneios, Inscrições, Campeonatos

## Regras de Crédito

### ✅ Créditos Aplicáveis

- **Apenas em Produtos**: Créditos da loja podem ser usados exclusivamente para compra de produtos físicos
- **Prioridade Automática**: O sistema automaticamente aplica créditos disponíveis aos produtos elegíveis

### ❌ Créditos NÃO Aplicáveis

- **Eventos/Torneios**: Inscrições em eventos **não podem** ser pagas com créditos
- **Métodos Aceitos**: Apenas Dinheiro/Pix ou Débito em Conta

## Cálculo de Pagamento Dividido

### Exemplo de Cálculo

**Cenário:**
- Jogador com R$ 100,00 de crédito
- Carrinho:
  - 1x Booster Pack (R$ 50,00) - Produto
  - 1x Inscrição Torneio (R$ 30,00) - Evento

**Cálculo:**

```typescript
productTotal = R$ 50,00
eventTotal = R$ 30,00
total = R$ 80,00

playerCredit = R$ 100,00
creditUsed = Math.min(playerCredit, productTotal) = R$ 50,00
productRemaining = productTotal - creditUsed = R$ 0,00
totalRemaining = productRemaining + eventTotal = R$ 30,00
```

**Resultado:**
- Crédito usado: R$ 50,00 (para o Booster)
- Saldo restante: R$ 30,00 (apenas o evento)
- Opções de pagamento: Dinheiro/Pix ou Debitar Conta

## Modal de Confirmação Customizado

### Informações Exibidas

1. **Resumo da Compra**
   - Produtos (Elegíveis para Crédito): R$ XX,XX
   - Eventos (Apenas Dinheiro/Conta): R$ XX,XX
   - Total Geral: R$ XX,XX

2. **Plano de Pagamento**
   - Crédito da Loja: - R$ XX,XX (em verde)
   - Saldo Restante: R$ XX,XX

3. **Opções de Pagamento** (se houver saldo restante)
   - Dinheiro/Pix
   - Debitar Conta

### Estados do Modal

**Estado 1: Pago Integralmente com Créditos**
```
Crédito usado: R$ 50,00
Saldo restante: R$ 0,00
Mensagem: "Pago integralmente com créditos"
```

**Estado 2: Pagamento Parcial com Créditos**
```
Crédito usado: R$ 50,00
Saldo restante: R$ 30,00
Opções: [Dinheiro/Pix] [Debitar Conta]
```

**Estado 3: Sem Créditos Disponíveis**
```
Crédito usado: R$ 0,00
Saldo restante: R$ 80,00
Opções: [Dinheiro/Pix] [Debitar Conta]
```

## Processamento da Venda

### Fluxo de Transações

1. **Salvar Itens Customizados** (se solicitado)
   - Converte itens avulsos em produtos permanentes
   - Gera novo ID único

2. **Criar Transações**
   - **Produtos**: Débito apenas do valor coberto por créditos
   - **Eventos**: Débito total (se método = 'account') ou R$ 0,00 (se método = 'cash')

3. **Atualizar Estoque**
   - Reduz quantidade de todos os produtos vendidos
   - Validação de estoque antes da venda

4. **Atualizar Saldo do Jogador**
   - Deduz créditos usados
   - Adiciona débito (se método = 'account')

### Exemplo de Código

```typescript
// Determinar valores a debitar
let debitProductAmount = confirmData.productTotal;
let debitEventAmount = confirmData.eventTotal;

if (paymentMethod === 'cash') {
  // Se pagando diferença em dinheiro, debitar apenas o que foi coberto por crédito
  debitProductAmount = confirmData.creditUsed;
  debitEventAmount = 0; // Pago totalmente em dinheiro
}

// Criar transação de produtos
if (productCartItems.length > 0 && debitProductAmount > 0) {
  await addTransaction({
    type: 'debit',
    category: 'product',
    amount: debitProductAmount,
    // ...
  });
}

// Criar transação de eventos
if (eventCartItems.length > 0 && debitEventAmount > 0) {
  await addTransaction({
    type: 'debit',
    category: 'event',
    amount: debitEventAmount,
    // ...
  });
}
```

## Validações

### Validação de Estoque

- **Antes de Adicionar ao Carrinho**: Verifica se há estoque suficiente
- **Antes de Finalizar Venda**: Valida novamente todo o carrinho
- **Mensagem de Erro**: "Estoque insuficiente: [Nome do Produto]"

### Validação de Dados

- **Itens Customizados**: Nome e preço obrigatórios
- **Seleção de Jogador**: Obrigatória antes de adicionar produtos
- **Carrinho Vazio**: Botão de checkout desabilitado

## UX/UI Features

### Feedback Visual

- **Badge de Quantidade**: Mostra total de itens no carrinho
- **Total em Destaque**: Valor total em fonte grande e cor primária
- **Animações**: Transições suaves entre steps
- **Cores Semânticas**:
  - Verde: Créditos disponíveis
  - Vermelho: Débitos/Saldo negativo
  - Amarelo/Laranja: Ações importantes

### Responsividade

- **Mobile-First**: Design otimizado para dispositivos móveis
- **Glassmorphism**: Efeitos de vidro fosco para cards
- **Bottom Sheet**: Resumo do carrinho fixo na parte inferior

## Status de Implementação

✅ **Implementado Corretamente** conforme especificação do Refactoring Plan v4.0

### Arquivos Principais

- [`pages/POS.tsx`](file:///c:/Users/lucas/Downloads/tcg-store-manager/pages/POS.tsx) - Componente principal
- [`context/StoreContext.tsx`](file:///c:/Users/lucas/Downloads/tcg-store-manager/context/StoreContext.tsx) - Lógica de transações
- [`utils/validators.ts`](file:///c:/Users/lucas/Downloads/tcg-store-manager/utils/validators.ts) - Validações

### Funcionalidades Verificadas

- [x] Separação de itens (Produtos vs Eventos)
- [x] Restrições de crédito (apenas produtos)
- [x] Pagamentos divididos
- [x] Modal customizado de confirmação
- [x] Validação de estoque
- [x] Itens customizados/avulsos
- [x] Atualização de saldo do jogador
- [x] Criação de transações
