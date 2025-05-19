'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from './AuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// Add paths that don't require authentication
const publicPaths = ['/customer/login', '/customer/register', '/customer'];

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // If we're on a public path, render children directly
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return (
            <div className='min-h-screen bg-gray-50'>
                <AuthProvider>
                    <Header />
                    {children}
                </AuthProvider>
                <Footer />
            </div>
        );
    }

    // For protected routes, wrap with AuthProvider
    return (
        <div className='min-h-screen bg-gray-50'>
            <AuthProvider>
                <Header />
                {children}
            </AuthProvider>
            <Footer />
        </div>
    );
}
