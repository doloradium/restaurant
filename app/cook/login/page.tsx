'use client';

import React, { useState, FormEvent } from 'react';
import { useCookAuth } from '@/app/CookAuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CookLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { cookLogin, cookError, cookLoading, cookUser } = useCookAuth();
    const router = useRouter();

    // If already logged in as a cook, redirect to dashboard
    React.useEffect(() => {
        if (cookUser) {
            router.push('/cook');
        }
    }, [cookUser, router]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await cookLogin(email, password);
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <div className='bg-white p-8 rounded-lg shadow-md w-96'>
                <h1 className='text-2xl font-bold text-center mb-6 text-red-600'>
                    Cook Login
                </h1>

                {cookError && (
                    <div className='mb-4 bg-red-100 text-red-800 p-3 rounded-md'>
                        {cookError}
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
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
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition duration-200 disabled:bg-red-400'
                        disabled={cookLoading}
                    >
                        {cookLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className='mt-4 text-center text-sm text-gray-600'>
                    This login is only for kitchen staff.
                    <br />
                    <Link href='/' className='text-red-600 hover:text-red-800'>
                        Return to main site
                    </Link>
                </div>
            </div>
        </div>
    );
}
