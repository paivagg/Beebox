import { SupabaseAuthService } from './SupabaseAuthService';

const authService = new SupabaseAuthService();
const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

import { supabase } from './supabaseClient';

export class ApiService {
    private baseURL = '/api'; // Now points to Edge Functions

    private async getHeaders(): Promise<HeadersInit> {
        const { data: { session } } = await supabase.auth.getSession();

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (session?.access_token) {
            headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        return headers;
    }

    private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const headers = await this.getHeaders();

        let response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        // Handle 401 - try to refresh token
        if (response.status === 401) {
            console.log('Token expired, refreshing...');
            const { data, error } = await supabase.auth.refreshSession();

            if (!error && data.session) {
                // Retry request with new token
                const newHeaders = await this.getHeaders();
                response = await fetch(url, {
                    ...options,
                    headers: {
                        ...newHeaders,
                        ...options.headers,
                    },
                });
            } else {
                // Refresh failed, user needs to login again
                console.error('Token refresh failed:', error);
                throw new Error('Authentication required');
            }
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(`${this.baseURL}${endpoint}`, {
            method: 'GET',
        });
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(`${this.baseURL}${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
        });
    }
}
