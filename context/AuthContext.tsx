import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { IAuthService, User } from '../src/core/interfaces/IAuthService';
import { SupabaseAuthService } from '../src/infrastructure/SupabaseAuthService';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string) => Promise<{ error: any }>;
    loginAsGuest: () => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize service
const authService: IAuthService = new SupabaseAuthService();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check initial user
        authService.getUser().then(u => {
            setUser(u);
            setLoading(false);
        });

        // Subscribe to changes
        const unsubscribe = authService.onAuthStateChange((u) => {
            setUser(u);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string) => {
        return authService.login(email);
    };

    const loginAsGuest = () => {
        localStorage.setItem('isGuest', 'true');
        const guestUser: User = {
            id: 'guest-id',
            email: 'guest@example.com',
            role: 'guest'
        };
        setUser(guestUser);
    };

    const logout = async () => {
        await authService.logout();
        localStorage.removeItem('isGuest');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, loginAsGuest, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
