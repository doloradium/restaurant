'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
});

export const useAuth = () => useContext(AuthContext);

// Add paths that don't require authentication
const publicPaths = ['/login', '/register', '/'];

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch('/api/auth/me');
                const data = await response.json();

                if (data.user) {
                    setUser(data.user);
                } else if (
                    !publicPaths.some((path) => pathname.startsWith(path))
                ) {
                    // Only redirect if we're not on a public path
                    router.push('/login');
                }
            } catch (error) {
                console.error('Auth verification error:', error);
                if (!publicPaths.some((path) => pathname.startsWith(path))) {
                    router.push('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        verifyAuth();
    }, [router, pathname]);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
