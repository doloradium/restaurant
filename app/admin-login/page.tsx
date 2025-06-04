'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminLoginPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if refresh parameter is present and attempt token refresh
    useEffect(() => {
        const refreshNeeded = searchParams.get('refresh') === 'true';

        if (refreshNeeded) {
            const attemptRefresh = async () => {
                setIsLoading(true);
                try {
                    // Call the refresh endpoint
                    const response = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        credentials: 'include',
                    });

                    const data = await response.json();

                    if (response.ok) {
                        // If refresh successful, redirect back to the admin page
                        toast.success('Сессия успешно обновлена');
                        router.push('/admin');
                    } else {
                        // If refresh failed, show error and stay on login page
                        toast.error(
                            data.error ||
                                'Сессия истекла. Пожалуйста, войдите снова.'
                        );
                    }
                } catch (error) {
                    console.error('Refresh error:', error);
                    toast.error(
                        'Не удалось обновить сессию. Пожалуйста, войдите снова.'
                    );
                } finally {
                    setIsLoading(false);
                }
            };

            attemptRefresh();
        }
    }, [searchParams, router]);

    const LoginSchema = Yup.object().shape({
        email: Yup.string()
            .email('Неверный формат email')
            .required('Email обязателен'),
        password: Yup.string()
            .required('Пароль обязателен')
            .min(6, 'Пароль должен быть не менее 6 символов'),
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
                    credentials: 'include',
                    body: JSON.stringify({
                        email: values.email,
                        password: values.password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    if (data.user && data.user.role === 'ADMIN') {
                        toast.success('Вход администратора успешен!');
                        router.push('/admin');
                    } else {
                        toast.error(
                            'Данная учетная запись не имеет прав администратора'
                        );
                    }
                } else {
                    toast.error(
                        data.error ||
                            'Ошибка входа. Пожалуйста, проверьте ваши учетные данные.'
                    );
                }
            } catch (error) {
                console.error('Login error:', error);
                toast.error(
                    'Ошибка входа. Пожалуйста, проверьте ваши учетные данные.'
                );
            } finally {
                setIsLoading(false);
            }
        },
    });

    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gray-100'>
            <div className='max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md'>
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-gray-900'>
                        Вход для администратора
                    </h2>
                    <p className='mt-2 text-sm text-gray-600'>
                        Войдите для доступа к панели администратора
                    </p>
                </div>

                <form className='mt-8 space-y-6' onSubmit={formik.handleSubmit}>
                    <div className='space-y-4'>
                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email адрес
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
                                    className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                                    placeholder='Email администратора'
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
                                Пароль
                            </label>
                            <div className='mt-1 relative'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FaLock className='text-gray-400' />
                                </div>
                                <input
                                    id='password'
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete='current-password'
                                    required
                                    className='appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                                    placeholder='Пароль администратора'
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
                    </div>

                    <div>
                        <button
                            type='submit'
                            disabled={isLoading}
                            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading ? 'Вход...' : 'Войти как администратор'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
