import { Player, Product, Event, Transaction } from '../../../types';

export interface IStorageService {
    // Players
    getPlayers(): Promise<Player[]>;
    savePlayer(player: Player): Promise<void>;
    updatePlayer(player: Player): Promise<void>;
    deletePlayer(id: string): Promise<void>;

    // Products
    getProducts(): Promise<Product[]>;
    saveProduct(product: Product): Promise<void>;
    updateProduct(product: Product): Promise<void>;

    // Events
    getEvents(): Promise<Event[]>;
    saveEvent(event: Event): Promise<void>;
    updateEvent(event: Event): Promise<void>;
    deleteEvent(id: string): Promise<void>;

    // Transactions
    getTransactions(): Promise<Transaction[]>;
    saveTransaction(transaction: Transaction): Promise<void>;
    deleteTransaction(id: string): Promise<void>;

    // System
    clearAll(): Promise<void>;

    // Store Profile
    getStoreProfile(): Promise<any>; // Using any to avoid circular dependency if types not imported, but better to import
    saveStoreProfile(profile: any): Promise<void>;

    // Store Settings
    getStoreSettings(): Promise<any>;
    saveStoreSettings(settings: any): Promise<void>;
}
