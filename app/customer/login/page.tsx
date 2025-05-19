'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const LoginSchema = Yup.object().shape({
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: LoginSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include', // Important for cookies
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                    }),
                });

                const data = await response.json();

                console.log(data);

                if (response.ok) {
                    toast.success('Successfully logged in!');
                    router.push('/customer');
                } else {
                    toast.error(
                        data.error ||
                            'Login failed. Please check your credentials.'
                    );
                }
            } catch (error) {
                console.error('Login error:', error);
                toast.error('Login failed. Please check your credentials.');
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gray-50'>
            <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md'>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-gray-900'>
                        Welcome Back
                    </h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        Sign in to your account to continue
                    </p>
                </div>

                <form className='mt-8 space-y-6' onSubmit={formik.handleSubmit}>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email Address
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaEnvelope className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    id='email'
                                    name='email'
                                    type='email'
                                    autoComplete='email'
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className='pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='you@example.com'
                                />
                            </div>
                            {formik.touched.email && formik.errors.email && (
                                <p className='mt-1 text-sm text-red-600'>
                                    {formik.errors.email}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor='password'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Password
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaLock className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    id='password'
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete='current-password'
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className='pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='••••••••'
                                />
                                <div
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className='h-5 w-5 text-gray-400' />
                                    ) : (
                                        <FaEye className='h-5 w-5 text-gray-400' />
                                    )}
                                </div>
                            </div>
                            {formik.touched.password &&
                                formik.errors.password && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {formik.errors.password}
                                    </p>
                                )}
                        </div>
                    </div>

                    <div className='flex items-center justify-between'>
                        <div className='flex items-center'>
                            <input
                                id='remember-me'
                                name='remember-me'
                                type='checkbox'
                                className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
                            />
                            <label
                                htmlFor='remember-me'
                                className='ml-2 block text-sm text-gray-900'
                            >
                                Remember me
                            </label>
                        </div>

                        <div className='text-sm'>
                            <Link
                                href='/forgot-password'
                                className='font-medium text-red-600 hover:text-red-500'
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-gray-600'>
                        Don't have an account?{' '}
                        <Link
                            href='/customer/register'
                            className='font-medium text-red-600 hover:text-red-500'
                        >
                            Register now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
