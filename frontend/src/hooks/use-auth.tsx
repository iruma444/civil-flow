'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, AuthResponse } from '@/types';
import { api, storage } from '@/lib';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = storage.getToken();
            if (token) {
                try {
                    const userData = await api.get<User>('/auth/me');
                    setUser(userData);
                } catch {
                    storage.clear();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await api.post<AuthResponse>('/auth/login', { email, password }, { skipAuth: true });
        storage.setToken(response.accessToken);
        storage.setUser(response.user);
        setUser(response.user);
    }, []);

    const register = useCallback(async (email: string, password: string, name: string) => {
        const response = await api.post<AuthResponse>('/auth/register', { email, password, name }, { skipAuth: true });
        storage.setToken(response.accessToken);
        storage.setUser(response.user);
        setUser(response.user);
    }, []);

    const logout = useCallback(() => {
        storage.clear();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
