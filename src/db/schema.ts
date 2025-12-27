import {
    toTypedRxJsonSchema,
    ExtractDocumentTypeFromTypedRxJsonSchema,
    RxJsonSchema
} from 'rxdb';
import { Player, Product, Event, Transaction, StoreProfile, StoreSettings } from '../../types';

export const playerSchemaLiteral = {
    title: 'player schema',
    description: 'describes a player',
    version: 2,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string'
        },
        nickname: {
            type: 'string'
        },
        avatar_url: {
            type: 'string'
        },
        dci: {
            type: 'string'
        },
        balance: {
            type: 'number'
        },
        email: {
            type: 'string'
        },
        last_activity: {
            type: 'string'
        },
        credit_updated_at: {
            type: 'string'
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['id', 'name', 'balance']
} as const;

const playerSchemaTyped = toTypedRxJsonSchema(playerSchemaLiteral);
export type PlayerDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof playerSchemaTyped>;
export const playerSchema: RxJsonSchema<PlayerDocType> = playerSchemaLiteral as any;

export const productSchemaLiteral = {
    title: 'product schema',
    description: 'describes a product',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string'
        },
        category: {
            type: 'string'
        },
        stock: {
            type: 'number'
        },
        price: {
            type: 'number'
        },
        image_url: {
            type: 'string'
        },
        product_collection: {
            type: 'string'
        },
        cost_price: {
            type: 'number'
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['id', 'name', 'price', 'stock']
} as const;

const productSchemaTyped = toTypedRxJsonSchema(productSchemaLiteral);
export type ProductDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof productSchemaTyped>;
export const productSchema: RxJsonSchema<ProductDocType> = productSchemaLiteral as any;

export const eventSchemaLiteral = {
    title: 'event schema',
    description: 'describes an event',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        date: {
            type: 'string'
        },
        title: {
            type: 'string'
        },
        price: {
            type: 'number'
        },
        time: {
            type: 'string'
        },
        max_enrolled: {
            type: 'number'
        },
        participants: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    player_id: {
                        type: 'string'
                    },
                    name: {
                        type: 'string'
                    },
                    avatar_url: {
                        type: 'string'
                    },
                    paid: {
                        type: 'boolean'
                    }
                }
            }
        },
        status: {
            type: 'string',
            enum: ['scheduled', 'finalized']
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['id', 'title', 'date', 'price']
} as const;

const eventSchemaTyped = toTypedRxJsonSchema(eventSchemaLiteral);
export type EventDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof eventSchemaTyped>;
export const eventSchema: RxJsonSchema<EventDocType> = eventSchemaLiteral as any;

export const transactionSchemaLiteral = {
    title: 'transaction schema',
    description: 'describes a transaction',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        player_id: {
            type: 'string'
        },
        type: {
            type: 'string',
            enum: ['credit', 'debit']
        },
        category: {
            type: 'string',
            enum: ['product', 'event', 'deposit', 'adjustment']
        },
        event_id: {
            type: 'string'
        },
        title: {
            type: 'string'
        },
        date: {
            type: 'string'
        },
        amount: {
            type: 'number'
        },
        icon: {
            type: 'string'
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['id', 'player_id', 'type', 'amount', 'date']
} as const;

const transactionSchemaTyped = toTypedRxJsonSchema(transactionSchemaLiteral);
export type TransactionDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof transactionSchemaTyped>;
export const transactionSchema: RxJsonSchema<TransactionDocType> = transactionSchemaLiteral as any;

export const storeProfileSchemaLiteral = {
    title: 'store profile schema',
    description: 'describes the store profile',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        name: {
            type: 'string'
        },
        avatar_url: {
            type: 'string'
        },
        role: {
            type: 'string'
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['id', 'name']
} as const;

const storeProfileSchemaTyped = toTypedRxJsonSchema(storeProfileSchemaLiteral);
export type StoreProfileDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof storeProfileSchemaTyped>;
export const storeProfileSchema: RxJsonSchema<StoreProfileDocType> = storeProfileSchemaLiteral as any;

export const storeSettingsSchemaLiteral = {
    title: 'store settings schema',
    description: 'describes the store settings',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        notifications: {
            type: 'boolean'
        },
        darkMode: {
            type: 'boolean'
        },
        soundEffects: {
            type: 'boolean'
        },
        updated_at: {
            type: 'string'
        }
    },
    required: ['id']
} as const;


const storeSettingsSchemaTyped = toTypedRxJsonSchema(storeSettingsSchemaLiteral);
export type StoreSettingsDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof storeSettingsSchemaTyped>;
export const storeSettingsSchema: RxJsonSchema<StoreSettingsDocType> = storeSettingsSchemaLiteral as any;

export const syncQueueSchemaLiteral = {
    title: 'sync queue schema',
    description: 'describes a sync queue item for offline operations',
    version: 1,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        operation: {
            type: 'string',
            enum: ['create', 'update', 'delete']
        },
        targetCollection: {
            type: 'string',
            enum: ['players', 'products', 'events', 'transactions', 'store_profile', 'store_settings']
        },
        data: {
            type: 'object'
        },
        retries: {
            type: 'number',
            default: 0
        },
        lastAttempt: {
            type: 'string'
        },
        error: {
            type: 'string'
        },
        created_at: {
            type: 'string'
        }
    },
    required: ['id', 'operation', 'targetCollection', 'data', 'created_at']
} as const;

const syncQueueSchemaTyped = toTypedRxJsonSchema(syncQueueSchemaLiteral);
export type SyncQueueDocType = ExtractDocumentTypeFromTypedRxJsonSchema<typeof syncQueueSchemaTyped>;
export const syncQueueSchema: RxJsonSchema<SyncQueueDocType> = syncQueueSchemaLiteral as any;
