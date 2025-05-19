'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const RegisterSchema = Yup.object().shape({
        name: Yup.string().required('Name is required'),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Confirm password is required'),
        terms: Yup.boolean()
            .oneOf([true], 'You must accept the terms and conditions')
            .required('You must accept the terms and conditions'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            terms: false,
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: values.name,
                        email: values.email,
                        password: values.password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success('Registration successful!');
                    router.push('/login');
                } else {
                    toast.error(
                        data.error || 'Registration failed. Please try again.'
                    );
                }
            } catch (error) {
                console.error('Registration error:', error);
                toast.error('Registration failed. Please try again.');
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
                        Create Account
                    </h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        Join us to start ordering delicious food
                    </p>
                </div>

                <form className='mt-8 space-y-6' onSubmit={formik.handleSubmit}>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Full Name
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaUser className='text-gray-400' />
                                </div>
                                <input
                                    id='name'
                                    type='text'
                                    autoComplete='name'
                                    required
                                    className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='Enter your full name'
                                    {...formik.getFieldProps('name')}
                                />
                            </div>
                            {formik.touched.name && formik.errors.name && (
                                <p className='mt-1 text-sm text-red-600'>
                                    {formik.errors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email Address
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaEnvelope className='text-gray-400' />
                                </div>
                                <input
                                    id='email'
                                    type='email'
                                    autoComplete='email'
                                    required
                                    className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='Enter your email'
                                    {...formik.getFieldProps('email')}
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
                                    <FaLock className='text-gray-400' />
                                </div>
                                <input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete='new-password'
                                    required
                                    className='appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='Enter your password'
                                    {...formik.getFieldProps('password')}
                                />
                                <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className='text-gray-400 hover:text-gray-500 focus:outline-none'
                                    >
                                        {showPassword ? (
                                            <FaEyeSlash />
                                        ) : (
                                            <FaEye />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {formik.touched.password &&
                                formik.errors.password && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {formik.errors.password}
                                    </p>
                                )}
                        </div>

                        <div>
                            <label
                                htmlFor='confirmPassword'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Confirm Password
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaLock className='text-gray-400' />
                                </div>
                                <input
                                    id='confirmPassword'
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete='new-password'
                                    required
                                    className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='Confirm your password'
                                    {...formik.getFieldProps('confirmPassword')}
                                />
                            </div>
                            {formik.touched.confirmPassword &&
                                formik.errors.confirmPassword && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {formik.errors.confirmPassword}
                                    </p>
                                )}
                        </div>

                        <div className='flex items-center'>
                            <input
                                id='terms'
                                type='checkbox'
                                className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
                                {...formik.getFieldProps('terms')}
                            />
                            <label
                                htmlFor='terms'
                                className='ml-2 block text-sm text-gray-900'
                            >
                                I agree to the{' '}
                                <Link
                                    href='/terms'
                                    className='font-medium text-red-600 hover:text-red-500'
                                >
                                    Terms and Conditions
                                </Link>
                            </label>
                        </div>
                        {formik.touched.terms && formik.errors.terms && (
                            <p className='mt-1 text-sm text-red-600'>
                                {formik.errors.terms}
                            </p>
                        )}
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading
                                ? 'Creating account...'
                                : 'Create account'}
                        </button>
                    </div>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-gray-600'>
                        Already have an account?{' '}
                        <Link
                            href='/login'
                            className='font-medium text-red-600 hover:text-red-500'
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
