export interface User {
    id: string;
    email: string;
    role?: string;
}

export interface IAuthService {
    login(email: string): Promise<{ error: any }>;
    logout(): Promise<{ error: any }>;
    getUser(): Promise<User | null>;
    onAuthStateChange(callback: (user: User | null) => void): () => void;
}
