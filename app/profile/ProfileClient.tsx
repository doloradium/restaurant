'use client';

import { useState, useEffect } from 'react';
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
    FaTrash,
    FaPlus,
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
    const [addresses, setAddresses] = useState<Address[]>(user.addresses || []);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name,
        surname: user.surname,
        email: user.email,
        phoneNumber: user.phoneNumber,
    });

    // Загружаем адреса пользователя при монтировании компонента
    useEffect(() => {
        fetchUserAddresses();
    }, []);

    // Функция для загрузки адресов пользователя
    const fetchUserAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            const response = await fetch('/api/users/addresses');

            if (!response.ok) {
                throw new Error('Failed to fetch user addresses');
            }

            const data = await response.json();
            setAddresses(data.addresses || []);
        } catch (error) {
            console.error('Error fetching user addresses:', error);
            toast.error('Не удалось загрузить адреса');
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    // Функция для удаления адреса
    const handleDeleteAddress = async (addressId: number) => {
        try {
            const response = await fetch(`/api/users/addresses/${addressId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete address');
            }

            // Обновляем список адресов
            setAddresses(
                addresses.filter((address) => address.id !== addressId)
            );
            toast.success('Адрес успешно удален');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Не удалось удалить адрес');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Для поля телефона допускаем только цифры и символ '+'
        if (name === 'phoneNumber') {
            // Фильтруем ввод, оставляя только разрешенные символы
            const filteredValue = value.replace(/[^\d+]/g, '');
            setFormData({
                ...formData,
                [name]: filteredValue,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
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
            // First show a loading toast
            const loadingToast = toast.loading('Выполняется выход...');

            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            // Clear loading toast
            toast.dismiss(loadingToast);

            if (!response.ok) {
                throw new Error('Failed to logout');
            }

            toast.success('Вы успешно вышли из системы');

            // Give toast a moment to display before redirect
            setTimeout(() => {
                // Use replace instead of push to prevent going back to profile after logout
                router.replace('/');
                router.refresh();
            }, 300);
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

                                                <div className='mb-6'>
                                                    <div className='flex justify-between items-center mb-3'>
                                                        <h3 className='text-lg font-medium text-gray-900'>
                                                            Адреса доставки
                                                        </h3>
                                                    </div>

                                                    {isLoadingAddresses ? (
                                                        <div className='flex justify-center my-4'>
                                                            <div className='animate-spin h-6 w-6 border-2 border-red-600 rounded-full border-t-transparent'></div>
                                                        </div>
                                                    ) : addresses &&
                                                      addresses.length > 0 ? (
                                                        <div className='space-y-3'>
                                                            {addresses.map(
                                                                (address) => (
                                                                    <div
                                                                        key={
                                                                            address.id
                                                                        }
                                                                        className='border border-gray-200 rounded-md p-3 flex justify-between items-start'
                                                                    >
                                                                        <div>
                                                                            <p className='font-medium text-gray-800'>
                                                                                {
                                                                                    address.city
                                                                                }
                                                                                ,{' '}
                                                                                {
                                                                                    address.street
                                                                                }
                                                                                ,{' '}
                                                                                {
                                                                                    address.houseNumber
                                                                                }
                                                                            </p>
                                                                            {(address.apartment ||
                                                                                address.entrance ||
                                                                                address.floor ||
                                                                                address.intercom) && (
                                                                                <p className='text-gray-600 text-sm mt-1'>
                                                                                    {[
                                                                                        address.apartment &&
                                                                                            `Кв: ${address.apartment}`,
                                                                                        address.entrance &&
                                                                                            `Подъезд: ${address.entrance}`,
                                                                                        address.floor &&
                                                                                            `Этаж: ${address.floor}`,
                                                                                        address.intercom &&
                                                                                            `Домофон: ${address.intercom}`,
                                                                                    ]
                                                                                        .filter(
                                                                                            Boolean
                                                                                        )
                                                                                        .join(
                                                                                            ', '
                                                                                        )}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteAddress(
                                                                                    address.id
                                                                                )
                                                                            }
                                                                            className='text-red-600 hover:text-red-800'
                                                                            title='Удалить адрес'
                                                                        >
                                                                            <FaTrash />
                                                                        </button>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className='text-center py-4 border border-gray-200 rounded-md'>
                                                            <p className='text-gray-500'>
                                                                У вас пока нет
                                                                сохраненных
                                                                адресов
                                                            </p>
                                                        </div>
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
