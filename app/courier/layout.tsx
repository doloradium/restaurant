'use client';

import React, { useEffect } from 'react';
import { useCourierAuth } from '../CourierAuthProvider';
import { useRouter, usePathname } from 'next/navigation';

export default function CourierLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { courierUser, courierLoading, courierLogout } = useCourierAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Protect all courier routes except login
    useEffect(() => {
        if (
            !courierLoading &&
            !courierUser &&
            !pathname.includes('/courier/login')
        ) {
            router.push('/courier/login');
        }
    }, [courierUser, courierLoading, router, pathname]);

    // Show loading state while checking authentication
    if (courierLoading && !pathname.includes('/courier/login')) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-100'>
                <div className='bg-white p-8 rounded-lg shadow-md w-96 text-center'>
                    <h2 className='text-xl mb-4'>Загрузка...</h2>
                    <div className='w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto'></div>
                    <p className='mt-4 text-gray-600'>
                        Проверка авторизации...
                    </p>
                </div>
            </div>
        );
    }

    // If on login page, render without header/footer
    if (pathname.includes('/courier/login')) {
        return <>{children}</>;
    }

    // Main courier layout with header for authenticated users
    return (
        <div className='min-h-screen flex flex-col bg-gray-100'>
            <header className='bg-blue-600 text-white'>
                <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
                    <div>
                        <h1 className='text-2xl font-bold'>Панель курьера</h1>
                    </div>
                    {courierUser && (
                        <div className='flex items-center space-x-4'>
                            <span>Здравствуйте, {courierUser.name}</span>
                            <button
                                onClick={courierLogout}
                                className='bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100'
                            >
                                Выйти
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
                    <p>Панель курьера &copy; {new Date().getFullYear()}</p>
                </div>
            </footer>
        </div>
    );
}
