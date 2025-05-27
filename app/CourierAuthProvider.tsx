'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type CourierUser = {
    id: number;
    name: string;
    email: string;
    role: string;
};

interface CourierAuthContextType {
    courierUser: CourierUser | null;
    courierLoading: boolean;
    courierLogin: (email: string, password: string) => Promise<void>;
    courierLogout: () => void;
    courierError: string | null;
}

const CourierAuthContext = createContext<CourierAuthContextType | undefined>(
    undefined
);

export function CourierAuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [courierUser, setCourierUser] = useState<CourierUser | null>(null);
    const [courierLoading, setCourierLoading] = useState(true);
    const [courierError, setCourierError] = useState<string | null>(null);
    const router = useRouter();

    // Check if we have a stored courier session on mount
    useEffect(() => {
        const checkCourierSession = async () => {
            try {
                const res = await fetch('/api/courier/auth/session', {
                    cache: 'no-store',
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setCourierUser(data.user);
                    }
                }
            } catch (error) {
                console.error('Error checking courier session:', error);
            } finally {
                setCourierLoading(false);
            }
        };

        checkCourierSession();
    }, []);

    // Login function specifically for couriers
    const courierLogin = async (email: string, password: string) => {
        setCourierLoading(true);
        setCourierError(null);

        try {
            const res = await fetch('/api/courier/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
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

            // Verify this is a courier user
            if (data.user.role !== 'COURIER') {
                throw new Error(
                    'Access denied. Only couriers can access this dashboard.'
                );
            }

            setCourierUser(data.user);
            router.push('/courier'); // Redirect to courier dashboard
        } catch (error: any) {
            setCourierError(error.message || 'Login failed');
            console.error('Courier login error:', error);
        } finally {
            setCourierLoading(false);
        }
    };

    const courierLogout = async () => {
        try {
            await fetch('/api/courier/auth/logout', {
                method: 'POST',
                cache: 'no-store',
            });
            setCourierUser(null);
            router.push('/courier/login');
        } catch (error) {
            console.error('Courier logout error:', error);
        }
    };

    return (
        <CourierAuthContext.Provider
            value={{
                courierUser,
                courierLoading,
                courierLogin,
                courierLogout,
                courierError,
            }}
        >
            {children}
        </CourierAuthContext.Provider>
    );
}

export function useCourierAuth() {
    const context = useContext(CourierAuthContext);
    if (context === undefined) {
        throw new Error(
            'useCourierAuth must be used within a CourierAuthProvider'
        );
    }
    return context;
}
