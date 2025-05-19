'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
    FaUser,
    FaEnvelope,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaPhone,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const RegisterSchema = Yup.object().shape({
        name: Yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters'),
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        phone: Yup.string()
            .matches(/^\+?[0-9]{10,14}$/, 'Phone number is not valid')
            .required('Phone number is required'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('password')], 'Passwords must match'),
        terms: Yup.boolean().oneOf(
            [true],
            'You must accept the terms and conditions'
        ),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            phone: '',
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
                    credentials: 'include', // Important for cookies
                    body: JSON.stringify({
                        name: values.name,
                        email: values.email,
                        password: values.password,
                        surname: '', // If you want to collect surname, add a field for it
                        // phone: values.phone, // Only include if your backend expects it
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast.success('Registration successful!');
                    router.push('/customer/login');
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
                        Create an Account
                    </h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        Join us to start ordering your favorite sushi
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
                                    <FaUser className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    id='name'
                                    name='name'
                                    type='text'
                                    autoComplete='name'
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className='pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='John Doe'
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
                                htmlFor='phone'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Phone Number
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaPhone className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    id='phone'
                                    name='phone'
                                    type='tel'
                                    autoComplete='tel'
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className='pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='+1 (555) 123-4567'
                                />
                            </div>
                            {formik.touched.phone && formik.errors.phone && (
                                <p className='mt-1 text-sm text-red-600'>
                                    {formik.errors.phone}
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
                                    autoComplete='new-password'
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

                        <div>
                            <label
                                htmlFor='confirmPassword'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Confirm Password
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaLock className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    id='confirmPassword'
                                    name='confirmPassword'
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    autoComplete='new-password'
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className='pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    placeholder='••••••••'
                                />
                                <div
                                    className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword ? (
                                        <FaEyeSlash className='h-5 w-5 text-gray-400' />
                                    ) : (
                                        <FaEye className='h-5 w-5 text-gray-400' />
                                    )}
                                </div>
                            </div>
                            {formik.touched.confirmPassword &&
                                formik.errors.confirmPassword && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {formik.errors.confirmPassword}
                                    </p>
                                )}
                        </div>

                        <div className='flex items-start'>
                            <div className='flex items-center h-5'>
                                <input
                                    id='terms'
                                    name='terms'
                                    type='checkbox'
                                    checked={formik.values.terms}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
                                />
                            </div>
                            <div className='ml-3 text-sm'>
                                <label
                                    htmlFor='terms'
                                    className='font-medium text-gray-700'
                                >
                                    I agree to the{' '}
                                    <Link
                                        href='/terms'
                                        className='text-red-600 hover:text-red-500'
                                    >
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link
                                        href='/privacy'
                                        className='text-red-600 hover:text-red-500'
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                                {formik.touched.terms &&
                                    formik.errors.terms && (
                                        <p className='mt-1 text-sm text-red-600'>
                                            {formik.errors.terms}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300 disabled:cursor-not-allowed'
                        >
                            {isLoading
                                ? 'Creating Account...'
                                : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-gray-600'>
                        Already have an account?{' '}
                        <Link
                            href='/customer/login'
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
