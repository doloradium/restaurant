'use client';

import { usePathname } from 'next/navigation';
import AuthProvider from './AuthProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import './globals.css';

// Add paths that don't require authentication
const publicPaths = ['/login', '/register', '/', '/menu', '/about', '/contact'];

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <html lang='en'>
            <body>
                <div className='min-h-screen bg-gray-50'>
                    <AuthProvider>
                        <Header />
                        {children}
                        <Footer />
                    </AuthProvider>
                </div>
            </body>
        </html>
    );
}
