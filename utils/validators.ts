import { Product, Event, Player } from '../types';
import { ERROR_MESSAGES, VALIDATION_LIMITS } from './constants';

/**
 * Resultado de validação
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Valida dados de um produto
 * @param product - Produto a ser validado
 * @returns Resultado da validação
 */
export const validateProduct = (product: Partial<Product>): ValidationResult => {
    const errors: string[] = [];

    // Validar nome
    if (!product.name || product.name.trim().length === 0) {
        errors.push(ERROR_MESSAGES.PRODUCT_NAME_REQUIRED);
    } else if (product.name.trim().length < VALIDATION_LIMITS.PRODUCT_NAME_MIN_LENGTH) {
        errors.push(`Nome deve ter pelo menos ${VALIDATION_LIMITS.PRODUCT_NAME_MIN_LENGTH} caracteres`);
    } else if (product.name.length > VALIDATION_LIMITS.PRODUCT_NAME_MAX_LENGTH) {
        errors.push(`Nome deve ter no máximo ${VALIDATION_LIMITS.PRODUCT_NAME_MAX_LENGTH} caracteres`);
    }

    // Validar categoria
    if (!product.category || product.category.trim().length === 0) {
        errors.push(ERROR_MESSAGES.PRODUCT_CATEGORY_REQUIRED);
    }

    // Validar preço
    if (product.price === undefined || product.price === null) {
        errors.push('Preço é obrigatório');
    } else if (product.price <= 0) {
        errors.push(ERROR_MESSAGES.PRODUCT_PRICE_INVALID);
    } else if (product.price > VALIDATION_LIMITS.MAX_PRICE) {
        errors.push(`Preço não pode ser maior que ${VALIDATION_LIMITS.MAX_PRICE}`);
    }

    // Validar estoque
    if (product.stock === undefined || product.stock === null) {
        errors.push('Estoque é obrigatório');
    } else if (product.stock < 0) {
        errors.push(ERROR_MESSAGES.PRODUCT_STOCK_INVALID);
    }

    // Validar preço de custo se fornecido
    if (product.costPrice !== undefined && product.costPrice !== null) {
        if (product.costPrice < 0) {
            errors.push('Preço de custo não pode ser negativo');
        }
        if (product.price !== undefined && product.costPrice > product.price) {
            errors.push('Preço de custo não pode ser maior que o preço de venda');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Valida dados de um evento
 * @param event - Evento a ser validado
 * @returns Resultado da validação
 */
export const validateEvent = (event: Partial<Event>): ValidationResult => {
    const errors: string[] = [];

    // Validar título
    if (!event.title || event.title.trim().length === 0) {
        errors.push(ERROR_MESSAGES.EVENT_TITLE_REQUIRED);
    } else if (event.title.trim().length < VALIDATION_LIMITS.EVENT_TITLE_MIN_LENGTH) {
        errors.push(`Título deve ter pelo menos ${VALIDATION_LIMITS.EVENT_TITLE_MIN_LENGTH} caracteres`);
    } else if (event.title.length > VALIDATION_LIMITS.EVENT_TITLE_MAX_LENGTH) {
        errors.push(`Título deve ter no máximo ${VALIDATION_LIMITS.EVENT_TITLE_MAX_LENGTH} caracteres`);
    }

    // Validar data
    if (!event.date) {
        errors.push('Data do evento é obrigatória');
    } else {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate < today) {
            errors.push(ERROR_MESSAGES.EVENT_DATE_INVALID);
        }
    }

    // Validar horário
    if (!event.time || event.time.trim().length === 0) {
        errors.push('Horário do evento é obrigatório');
    }

    // Validar preço
    if (event.price === undefined || event.price === null) {
        errors.push('Preço é obrigatório');
    } else if (event.price < 0) {
        errors.push(ERROR_MESSAGES.EVENT_PRICE_INVALID);
    } else if (event.price > VALIDATION_LIMITS.MAX_PRICE) {
        errors.push(`Preço não pode ser maior que ${VALIDATION_LIMITS.MAX_PRICE}`);
    }

    // Validar número máximo de inscritos
    if (event.maxEnrolled === undefined || event.maxEnrolled === null) {
        errors.push('Número máximo de inscritos é obrigatório');
    } else if (event.maxEnrolled <= 0) {
        errors.push(ERROR_MESSAGES.EVENT_MAX_ENROLLED_INVALID);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Valida dados de um jogador
 * @param player - Jogador a ser validado
 * @returns Resultado da validação
 */
export const validatePlayer = (player: Partial<Player>): ValidationResult => {
    const errors: string[] = [];

    // Validar nome
    if (!player.name || player.name.trim().length === 0) {
        errors.push(ERROR_MESSAGES.PLAYER_NAME_REQUIRED);
    } else if (player.name.trim().length < VALIDATION_LIMITS.PLAYER_NAME_MIN_LENGTH) {
        errors.push(`Nome deve ter pelo menos ${VALIDATION_LIMITS.PLAYER_NAME_MIN_LENGTH} caracteres`);
    } else if (player.name.length > VALIDATION_LIMITS.PLAYER_NAME_MAX_LENGTH) {
        errors.push(`Nome deve ter no máximo ${VALIDATION_LIMITS.PLAYER_NAME_MAX_LENGTH} caracteres`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Valida se há estoque suficiente para uma quantidade
 * @param productId - ID do produto
 * @param quantity - Quantidade desejada
 * @param products - Lista de produtos
 * @returns true se há estoque suficiente, false caso contrário
 */
export const validateStock = (
    productId: string,
    quantity: number,
    products: Product[]
): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
        return false;
    }
    return product.stock >= quantity;
};

/**
 * Valida valor de transação
 * @param amount - Valor da transação
 * @returns Resultado da validação
 */
export const validateTransactionAmount = (amount: number): ValidationResult => {
    const errors: string[] = [];

    if (amount <= 0) {
        errors.push(ERROR_MESSAGES.TRANSACTION_AMOUNT_INVALID);
    } else if (amount > VALIDATION_LIMITS.MAX_PRICE) {
        errors.push(`Valor não pode ser maior que ${VALIDATION_LIMITS.MAX_PRICE}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Valida email
 * @param email - Email a ser validado
 * @returns true se válido, false caso contrário
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Valida URL
 * @param url - URL a ser validada
 * @returns true se válida, false caso contrário
 */
export const validateURL = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};
