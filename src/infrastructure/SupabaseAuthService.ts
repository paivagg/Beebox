import { supabase } from './supabaseClient';
import { IAuthService, User } from '../core/interfaces/IAuthService';

export class SupabaseAuthService implements IAuthService {
    private supabase = supabase;

    constructor() {
        // Using singleton client
    }

    async login(email: string): Promise<{ error: any }> {
        if (!this.supabase) return { error: 'Supabase not configured' };
        // Using Magic Link for simplicity, or we can use password if preferred.
        // Let's use Magic Link as it's passwordless and modern.
        const { error } = await this.supabase.auth.signInWithOtp({ email });
        return { error };
    }

    async logout(): Promise<{ error: any }> {
        if (!this.supabase) return { error: null };
        const { error } = await this.supabase.auth.signOut();
        return { error };
    }

    async getUser(): Promise<User | null> {
        if (!this.supabase) return null;
        const { data: { user } } = await this.supabase.auth.getUser();
        if (!user) return null;
        return {
            id: user.id,
            email: user.email!,
            role: user.role
        };
    }

    async getToken(): Promise<string | null> {
        if (!this.supabase) return null;
        const { data: { session } } = await this.supabase.auth.getSession();
        return session?.access_token || null;
    }

    onAuthStateChange(callback: (user: User | null) => void): () => void {
        if (!this.supabase) return () => { };
        const { data: { subscription } } = this.supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ? {
                id: session.user.id,
                email: session.user.email!,
                role: session.user.role
            } : null;
            callback(user);
        });

        return () => subscription.unsubscribe();
    }
}
