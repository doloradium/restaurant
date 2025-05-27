'use client';

import React, { useEffect } from 'react';
import { useCookAuth } from '../CookAuthProvider';
import { useRouter, usePathname } from 'next/navigation';

export default function CookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { cookUser, cookLoading, cookLogout } = useCookAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Protect all cook routes except login
    useEffect(() => {
        if (!cookLoading && !cookUser && !pathname.includes('/cook/login')) {
            router.push('/cook/login');
        }
    }, [cookUser, cookLoading, router, pathname]);

    // Show loading state while checking authentication
    if (cookLoading && !pathname.includes('/cook/login')) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-100'>
                <div className='bg-white p-8 rounded-lg shadow-md w-96 text-center'>
                    <h2 className='text-xl mb-4'>Loading...</h2>
                    <div className='w-12 h-12 border-t-4 border-red-500 border-solid rounded-full animate-spin mx-auto'></div>
                    <p className='mt-4 text-gray-600'>
                        Verifying authentication...
                    </p>
                </div>
            </div>
        );
    }

    // If on login page, render without header/footer
    if (pathname.includes('/cook/login')) {
        return <>{children}</>;
    }

    // Main cook layout with header for authenticated users
    return (
        <div className='min-h-screen flex flex-col bg-gray-100'>
            <header className='bg-red-600 text-white'>
                <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
                    <div>
                        <h1 className='text-2xl font-bold'>
                            Kitchen Dashboard
                        </h1>
                    </div>
                    {cookUser && (
                        <div className='flex items-center space-x-4'>
                            <span>Welcome, {cookUser.name}</span>
                            <button
                                onClick={cookLogout}
                                className='bg-white text-red-600 px-4 py-2 rounded hover:bg-gray-100'
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            <main className='container mx-auto px-4 py-6 flex-grow'>
                {children}
            </main>

            <footer className='bg-gray-800 text-white py-4'>
                <div className='container mx-auto px-4 text-center'>
                    <p>
                        Kitchen Staff Portal &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </footer>
        </div>
    );
}
