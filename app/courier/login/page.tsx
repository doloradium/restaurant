'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useCourierAuth } from '@/app/CourierAuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CourierLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { courierLogin, courierError, courierLoading, courierUser } =
        useCourierAuth();
    const router = useRouter();

    // If already logged in as a courier, redirect to dashboard
    useEffect(() => {
        if (courierUser) {
            router.push('/courier');
        }
    }, [courierUser, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await courierLogin(email, password);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <div className='bg-white p-8 rounded-lg shadow-md w-96'>
                <h1 className='text-2xl font-bold text-center mb-6 text-blue-600'>
                    Courier Login
                </h1>

                {courierError && (
                    <div className='mb-4 bg-red-100 text-red-800 p-3 rounded-md'>
                        {courierError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label
                            className='block text-gray-700 mb-2'
                            htmlFor='email'
                        >
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        />
                    </div>

                    <div className='mb-6'>
                        <label
                            className='block text-gray-700 mb-2'
                            htmlFor='password'
                        >
                            Password
                        </label>
                        <input
                            id='password'
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-400'
                        disabled={courierLoading}
                    >
                        {courierLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className='mt-4 text-center text-sm text-gray-600'>
                    This login is only for delivery couriers.
                    <br />
                    <Link
                        href='/'
                        className='text-blue-600 hover:text-blue-800'
                    >
                        Return to main site
                    </Link>
                </div>
            </div>
        </div>
    );
}
