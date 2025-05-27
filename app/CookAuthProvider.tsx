'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type CookUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

interface CookAuthContextType {
    cookUser: CookUser | null;
    cookLoading: boolean;
    cookLogin: (email: string, password: string) => Promise<void>;
    cookLogout: () => void;
    cookError: string | null;
}

const CookAuthContext = createContext<CookAuthContextType | undefined>(
    undefined
);

export function CookAuthProvider({ children }: { children: React.ReactNode }) {
    const [cookUser, setCookUser] = useState<CookUser | null>(null);
    const [cookLoading, setCookLoading] = useState(true);
    const [cookError, setCookError] = useState<string | null>(null);
    const router = useRouter();

    // Check if we have a stored cook session on mount
    useEffect(() => {
        const checkCookSession = async () => {
            try {
                const res = await fetch('/api/cook/auth/session', {
                    // Add cache: 'no-store' to prevent caching issues
                    cache: 'no-store',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setCookUser(data.user);
                    }
                }
            } catch (error) {
                console.error('Error checking cook session:', error);
            } finally {
                setCookLoading(false);
            }
        };

        checkCookSession();
    }, []);

    // Login function specifically for cooks
    const cookLogin = async (email: string, password: string) => {
        setCookLoading(true);
        setCookError(null);

        try {
            const res = await fetch('/api/cook/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                // Add cache: 'no-store' to prevent caching issues
                cache: 'no-store',
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = 'Failed to login';

                try {
                    // Try to parse as JSON if possible
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // If not JSON, use text or default message
                    errorMessage = errorText || errorMessage;
                }

                throw new Error(errorMessage);
            }

            const data = await res.json();

            // Verify this is a cook user
            if (data.user.role !== 'COOK') {
                throw new Error(
                    'Access denied. Only cooks can access this dashboard.'
                );
            }

            setCookUser(data.user);
            router.push('/cook'); // Redirect to cook dashboard
        } catch (error: any) {
            setCookError(error.message || 'Login failed');
            console.error('Cook login error:', error);
        } finally {
            setCookLoading(false);
        }
    };

    const cookLogout = async () => {
        try {
            await fetch('/api/cook/auth/logout', {
                method: 'POST',
                // Add cache: 'no-store' to prevent caching issues
                cache: 'no-store',
            });
            setCookUser(null);
            router.push('/cook/login');
        } catch (error) {
            console.error('Cook logout error:', error);
        }
    };

    return (
        <CookAuthContext.Provider
            value={{ cookUser, cookLoading, cookLogin, cookLogout, cookError }}
        >
            {children}
        </CookAuthContext.Provider>
    );
}

export function useCookAuth() {
    const context = useContext(CookAuthContext);
    if (context === undefined) {
        throw new Error('useCookAuth must be used within a CookAuthProvider');
    }
    return context;
}
