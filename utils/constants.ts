/**
 * Constantes da aplicação
 */

// Chaves do localStorage
export const STORAGE_KEYS = {
    PLAYERS: 'tcg-store-players',
    PRODUCTS: 'tcg-store-products',
    EVENTS: 'tcg-store-events',
    TRANSACTIONS: 'tcg-store-transactions',
    STORE_PROFILE: 'tcg-store-profile',
    STORE_SETTINGS: 'tcg-store-settings',
} as const;

// Mensagens de erro
export const ERROR_MESSAGES = {
    PRODUCT_NAME_REQUIRED: 'Nome do produto é obrigatório',
    PRODUCT_PRICE_INVALID: 'Preço deve ser maior que zero',
    PRODUCT_STOCK_INVALID: 'Estoque não pode ser negativo',
    PRODUCT_CATEGORY_REQUIRED: 'Categoria é obrigatória',

    EVENT_TITLE_REQUIRED: 'Título do evento é obrigatório',
    EVENT_DATE_INVALID: 'Data do evento não pode ser no passado',
    EVENT_PRICE_INVALID: 'Preço deve ser maior ou igual a zero',
    EVENT_MAX_ENROLLED_INVALID: 'Número máximo de inscritos deve ser maior que zero',

    PLAYER_NAME_REQUIRED: 'Nome do jogador é obrigatório',

    TRANSACTION_AMOUNT_INVALID: 'Valor da transação deve ser maior que zero',

    STOCK_INSUFFICIENT: 'Estoque insuficiente',
    STOCK_CHECK_FAILED: 'Erro ao verificar estoque',
} as const;

// Mensagens de sucesso
export const SUCCESS_MESSAGES = {
    PRODUCT_ADDED: 'Produto adicionado com sucesso',
    PRODUCT_UPDATED: 'Produto atualizado com sucesso',
    EVENT_CREATED: 'Evento criado com sucesso',
    PLAYER_ADDED: 'Jogador adicionado com sucesso',
    TRANSACTION_COMPLETED: 'Transação realizada com sucesso',
    SALE_COMPLETED: 'Venda realizada com sucesso',
} as const;

// Limites de validação
export const VALIDATION_LIMITS = {
    PRODUCT_NAME_MAX_LENGTH: 100,
    PRODUCT_NAME_MIN_LENGTH: 3,
    EVENT_TITLE_MAX_LENGTH: 100,
    EVENT_TITLE_MIN_LENGTH: 3,
    PLAYER_NAME_MAX_LENGTH: 100,
    PLAYER_NAME_MIN_LENGTH: 3,
    MAX_PRICE: 999999.99,
    MIN_PRICE: 0.01,
} as const;

// Configurações padrão
export const DEFAULT_SETTINGS = {
    TOAST_DURATION: 3000, // 3 segundos
    ANIMATION_DURATION: 300, // 300ms
} as const;
