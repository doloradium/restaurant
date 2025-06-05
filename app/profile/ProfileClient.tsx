'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaUser,
    FaHistory,
    FaHome,
    FaEdit,
    FaLock,
    FaCreditCard,
    FaMapMarkerAlt,
    FaSignOutAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Address {
    id: number;
    city: string;
    street: string;
    houseNumber: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    intercom?: string | null;
}

interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    phoneNumber?: string | null;
    role: string;
    rating?: number | null;
    addresses?: Address[];
    // For backward compatibility
    street?: string;
    house?: string;
    apartment?: string;
}

interface ProfileClientProps {
    user: User;
}

export default function ProfileClient({ user }: ProfileClientProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('profile');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        surname: user.surname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        street: user.street,
        house: user.house,
        apartment: user.apartment,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validatePhoneNumber = (phone: string) => {
        // Базовая валидация российского номера телефона (принимает форматы +7XXXXXXXXXX или 8XXXXXXXXXX)
        if (!phone) return true; // Допускаем пустой номер
        const phoneRegex = /^(\+7|8)[0-9]{10}$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валидация телефона
        if (
            formData.phoneNumber &&
            !validatePhoneNumber(formData.phoneNumber)
        ) {
            toast.error(
                'Пожалуйста, введите корректный номер телефона в формате +7XXXXXXXXXX или 8XXXXXXXXXX'
            );
            return;
        }

        try {
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            toast.success('Профиль успешно обновлен!');
            setEditMode(false);
            router.refresh();
        } catch (error) {
            toast.error('Ошибка обновления профиля');
            console.error('Error updating profile:', error);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to logout');
            }

            toast.success('Вы успешно вышли из системы');
            router.push('/');
            router.refresh();
        } catch (error) {
            toast.error('Ошибка выхода из системы');
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className='bg-gray-50 min-h-screen py-12'>
            <div className='container mx-auto px-4'>
                <div className='max-w-6xl mx-auto'>
                    <div className='flex flex-col md:flex-row gap-8'>
                        {/* Sidebar */}
                        <div className='w-full md:w-64'>
                            <div className='bg-white rounded-lg shadow-sm overflow-hidden sticky top-4'>
                                <div className='p-6 bg-red-600 text-white'>
                                    <div className='h-20 w-20 mx-auto bg-white rounded-full flex items-center justify-center text-red-600 text-3xl mb-3'>
                                        <FaUser />
                                    </div>
                                    <h2 className='text-center font-bold text-xl'>
                                        {user.name} {user.surname}
                                    </h2>
                                    <p className='text-center text-sm text-red-100'>
                                        {user.email}
                                    </p>
                                </div>

                                <nav className='p-4'>
                                    <ul className='space-y-1'>
                                        <li>
                                            <button
                                                onClick={() =>
                                                    setActiveTab('profile')
                                                }
                                                className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                                                    activeTab === 'profile'
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <FaUser className='mr-3' />{' '}
                                                Профиль
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() =>
                                                    setActiveTab('orders')
                                                }
                                                className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                                                    activeTab === 'orders'
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <FaHistory className='mr-3' />{' '}
                                                История заказов
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className='w-full text-left px-4 py-2 rounded-md flex items-center text-red-600 hover:bg-red-50'
                                            >
                                                <FaSignOutAlt className='mr-3' />{' '}
                                                Выйти
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className='flex-1'>
                            {activeTab === 'profile' && (
                                <div className='bg-white rounded-lg shadow-sm'>
                                    <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
                                        <h1 className='text-2xl font-bold text-gray-900'>
                                            Мой профиль
                                        </h1>
                                        {!editMode && (
                                            <button
                                                onClick={() =>
                                                    setEditMode(true)
                                                }
                                                className='flex items-center text-red-600 hover:text-red-700'
                                            >
                                                <FaEdit className='mr-1' />{' '}
                                                Редактировать профиль
                                            </button>
                                        )}
                                    </div>

                                    <div className='p-6'>
                                        {editMode ? (
                                            <form onSubmit={handleSubmit}>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                                                    <div>
                                                        <label
                                                            htmlFor='name'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Имя
                                                        </label>
                                                        <input
                                                            type='text'
                                                            id='name'
                                                            name='name'
                                                            value={
                                                                formData.name
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor='surname'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Фамилия
                                                        </label>
                                                        <input
                                                            type='text'
                                                            id='surname'
                                                            name='surname'
                                                            value={
                                                                formData.surname
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor='email'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Email адрес
                                                        </label>
                                                        <input
                                                            type='email'
                                                            id='email'
                                                            name='email'
                                                            value={
                                                                formData.email
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor='phoneNumber'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Телефон
                                                        </label>
                                                        <input
                                                            type='tel'
                                                            id='phoneNumber'
                                                            name='phoneNumber'
                                                            value={
                                                                formData.phoneNumber ||
                                                                ''
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder='+7XXXXXXXXXX'
                                                            pattern='^(\+7|8)[0-9]{10}$'
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                        />
                                                    </div>
                                                </div>

                                                <div className='mb-6'>
                                                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                                        Адрес доставки
                                                    </h3>
                                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                                        <div className='md:col-span-2'>
                                                            <label
                                                                htmlFor='street'
                                                                className='block text-sm font-medium text-gray-700 mb-1'
                                                            >
                                                                Улица
                                                            </label>
                                                            <input
                                                                type='text'
                                                                id='street'
                                                                name='street'
                                                                value={
                                                                    formData.street
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label
                                                                htmlFor='house'
                                                                className='block text-sm font-medium text-gray-700 mb-1'
                                                            >
                                                                Дом
                                                            </label>
                                                            <input
                                                                type='text'
                                                                id='house'
                                                                name='house'
                                                                value={
                                                                    formData.house
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                            />
                                                        </div>
                                                        <div>
                                                            <label
                                                                htmlFor='apartment'
                                                                className='block text-sm font-medium text-gray-700 mb-1'
                                                            >
                                                                Квартира
                                                            </label>
                                                            <input
                                                                type='text'
                                                                id='apartment'
                                                                name='apartment'
                                                                value={
                                                                    formData.apartment
                                                                }
                                                                onChange={
                                                                    handleChange
                                                                }
                                                                className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='flex justify-end space-x-4'>
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            setEditMode(false)
                                                        }
                                                        className='px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                                                    >
                                                        Отмена
                                                    </button>
                                                    <button
                                                        type='submit'
                                                        className='px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700'
                                                    >
                                                        Сохранить изменения
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
                                                    <div>
                                                        <h3 className='text-sm font-medium text-gray-500'>
                                                            Имя
                                                        </h3>
                                                        <p className='mt-1'>
                                                            {user.name}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h3 className='text-sm font-medium text-gray-500'>
                                                            Фамилия
                                                        </h3>
                                                        <p className='mt-1'>
                                                            {user.surname}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h3 className='text-sm font-medium text-gray-500'>
                                                            Email адрес
                                                        </h3>
                                                        <p className='mt-1'>
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h3 className='text-sm font-medium text-gray-500'>
                                                            Телефон
                                                        </h3>
                                                        <p className='mt-1'>
                                                            {user.phoneNumber ||
                                                                'Не указан'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className='text-sm font-medium text-gray-500 mb-2'>
                                                        Адрес доставки
                                                    </h3>
                                                    {user.street ? (
                                                        <p>
                                                            {user.street},{' '}
                                                            {user.house}
                                                            {user.apartment
                                                                ? `, кв. ${user.apartment}`
                                                                : ''}
                                                        </p>
                                                    ) : (
                                                        <p className='text-gray-400'>
                                                            Адрес не указан
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div className='bg-white rounded-lg shadow-sm'>
                                    <div className='p-6 border-b border-gray-200'>
                                        <h1 className='text-2xl font-bold text-gray-900'>
                                            История заказов
                                        </h1>
                                    </div>
                                    <div className='p-6'>
                                        <div className='text-center py-8'>
                                            <p className='text-gray-500 mb-4'>
                                                Вы еще не сделали ни одного
                                                заказа.
                                            </p>
                                            <Link
                                                href='/menu'
                                                className='bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200'
                                            >
                                                Сделайте первый заказ
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
