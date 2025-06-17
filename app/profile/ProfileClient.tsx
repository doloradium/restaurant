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
    FaCheck,
    FaClock,
    FaTruck,
    FaUtensils,
    FaTimes,
    FaShoppingCart,
    FaRedo,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { format, isValid, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useCart } from '@/app/CartProvider';

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

interface MenuItem {
    id: number;
    name: string;
    price: number;
}

interface OrderItem {
    id: number;
    quantity: number;
    item: MenuItem;
}

interface Order {
    id: number;
    status: string;
    isPaid: boolean;
    paymentType: string;
    createdAt: string;
    deliveryTime: string;
    orderItems: OrderItem[];
    address?: Address;
    total?: number;
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
    const { setCartItems, clearCart } = useCart();
    const [activeTab, setActiveTab] = useState('profile');
    const [editMode, setEditMode] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>(user.addresses || []);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [repeatOrderLoading, setRepeatOrderLoading] = useState<number | null>(
        null
    );
    const [formData, setFormData] = useState({
        name: user.name,
        surname: user.surname,
        email: user.email,
        phoneNumber: user.phoneNumber,
    });

    // Проверяем URL параметры при монтировании компонента
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tabParam = searchParams.get('tab');

        if (tabParam && ['profile', 'orders'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, []);

    // Загружаем адреса пользователя при монтировании компонента
    useEffect(() => {
        fetchUserAddresses();
    }, []);

    // Загружаем заказы пользователя при переключении на вкладку истории заказов
    useEffect(() => {
        if (activeTab === 'orders') {
            fetchUserOrders();
        }
    }, [activeTab]);

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

    // Функция для загрузки заказов пользователя
    const fetchUserOrders = async () => {
        try {
            setIsLoadingOrders(true);
            const response = await fetch(`/api/orders?userId=${user.id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch user orders');
            }

            const data = await response.json();

            const ordersWithTotal = data.map((order: Order) => {
                const total = order.orderItems.reduce(
                    (sum: number, item: OrderItem) =>
                        sum + item.item.price * item.quantity,
                    0
                );
                return { ...order, total };
            });

            setOrders(ordersWithTotal);
        } catch (error) {
            console.error('Error fetching user orders:', error);
            toast.error('Не удалось загрузить историю заказов');
        } finally {
            setIsLoadingOrders(false);
        }
    };

    // Функция для форматирования даты
    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'Дата недоступна';

            // Try to parse the date
            const parsedDate = parseISO(dateString);

            // Check if the date is valid
            if (!isValid(parsedDate)) {
                console.error('Invalid date:', dateString);
                return 'Дата недоступна';
            }

            return format(parsedDate, 'dd MMMM yyyy, HH:mm', { locale: ru });
        } catch (error) {
            console.error('Error formatting date:', error, dateString);
            return 'Дата недоступна';
        }
    };

    // Функция для отображения статуса заказа
    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'PENDING':
                return {
                    text: 'Ожидает оплаты',
                    icon: <FaClock className='text-yellow-500' />,
                };
            case 'CONFIRMED':
                return {
                    text: 'Подтвержден',
                    icon: <FaCheck className='text-green-500' />,
                };
            case 'COOKING':
                return {
                    text: 'Готовится',
                    icon: <FaUtensils className='text-orange-500' />,
                };
            case 'READY_FOR_DELIVERY':
                return {
                    text: 'Готов к доставке',
                    icon: <FaHome className='text-blue-500' />,
                };
            case 'DELIVERING':
                return {
                    text: 'В пути',
                    icon: <FaTruck className='text-purple-500' />,
                };
            case 'COMPLETED':
                return {
                    text: 'Доставлен',
                    icon: <FaCheck className='text-green-500' />,
                };
            case 'DELIVERED':
                return {
                    text: 'Доставлен',
                    icon: <FaCheck className='text-green-500' />,
                };
            case 'CANCELED':
                return {
                    text: 'Отменен',
                    icon: <FaTimes className='text-red-500' />,
                };
            default:
                return {
                    text: status,
                    icon: <FaClock className='text-gray-500' />,
                };
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

    // Функция для повторения заказа
    const handleRepeatOrder = async (order: Order) => {
        try {
            setRepeatOrderLoading(order.id);

            // Очищаем корзину
            await clearCart();

            // Добавляем элементы заказа в корзину
            const newCartItems = order.orderItems.map((item) => ({
                itemId: item.item.id,
                quantity: item.quantity,
                item: item.item,
            }));

            // Устанавливаем новые элементы корзины
            await setCartItems(newCartItems);

            // Показываем уведомление
            toast.success('Товары добавлены в корзину');

            // Перенаправляем пользователя на страницу корзины
            router.push('/cart');
        } catch (error) {
            console.error('Error repeating order:', error);
            toast.error('Не удалось добавить товары в корзину');
            setRepeatOrderLoading(null);
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
                                        {isLoadingOrders ? (
                                            <div className='flex justify-center my-4'>
                                                <div className='animate-spin h-8 w-8 border-2 border-red-600 rounded-full border-t-transparent'></div>
                                            </div>
                                        ) : orders.length > 0 ? (
                                            <div className='space-y-6'>
                                                {orders.map((order) => (
                                                    <div
                                                        key={order.id}
                                                        className='border border-gray-200 rounded-lg overflow-hidden'
                                                    >
                                                        <div className='bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center'>
                                                            <div>
                                                                <span className='text-gray-500'>
                                                                    Заказ №
                                                                    {order.id}
                                                                </span>
                                                                <div className='text-sm text-gray-500 mt-1'>
                                                                    от{' '}
                                                                    {formatDate(
                                                                        order.createdAt
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className='flex items-center'>
                                                                {
                                                                    getStatusDisplay(
                                                                        order.status
                                                                    ).icon
                                                                }
                                                                <span className='ml-2 font-medium'>
                                                                    {
                                                                        getStatusDisplay(
                                                                            order.status
                                                                        ).text
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className='p-4'>
                                                            <div className='mb-4'>
                                                                <h3 className='font-medium text-gray-800 mb-2'>
                                                                    Состав
                                                                    заказа:
                                                                </h3>
                                                                <ul className='space-y-2'>
                                                                    {order.orderItems.map(
                                                                        (
                                                                            item
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                                className='flex justify-between'
                                                                            >
                                                                                <div>
                                                                                    <span className='text-gray-800'>
                                                                                        {
                                                                                            item
                                                                                                .item
                                                                                                .name
                                                                                        }
                                                                                    </span>
                                                                                    <span className='text-gray-500 ml-2'>
                                                                                        ×{' '}
                                                                                        {
                                                                                            item.quantity
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <span className='text-gray-800'>
                                                                                    {(
                                                                                        item
                                                                                            .item
                                                                                            .price *
                                                                                        item.quantity
                                                                                    ).toFixed(
                                                                                        2
                                                                                    )}{' '}
                                                                                    ₽
                                                                                </span>
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                                <div className='mt-3 pt-3 border-t border-gray-100 flex justify-between'>
                                                                    <span className='font-medium'>
                                                                        Итого:
                                                                    </span>
                                                                    <span className='font-bold text-lg'>
                                                                        {order.total?.toFixed(
                                                                            2
                                                                        )}{' '}
                                                                        ₽
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className='mt-4 pt-4 border-t border-gray-200'>
                                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                                    <div>
                                                                        <h3 className='font-medium text-gray-800 mb-1'>
                                                                            Способ
                                                                            оплаты:
                                                                        </h3>
                                                                        <p className='text-gray-700'>
                                                                            {order.paymentType ===
                                                                            'CASH'
                                                                                ? 'Наличными при получении'
                                                                                : 'Картой онлайн'}
                                                                            {order.isPaid
                                                                                ? ' (Оплачено)'
                                                                                : ' (Не оплачено)'}
                                                                        </p>
                                                                    </div>

                                                                    <div>
                                                                        <h3 className='font-medium text-gray-800 mb-1'>
                                                                            Доставка:
                                                                        </h3>
                                                                        <p className='text-gray-700'>
                                                                            {formatDate(
                                                                                order.deliveryTime
                                                                            )}
                                                                        </p>
                                                                        {order.address && (
                                                                            <p className='text-gray-700 mt-1'>
                                                                                {
                                                                                    order
                                                                                        .address
                                                                                        .city
                                                                                }

                                                                                ,{' '}
                                                                                {
                                                                                    order
                                                                                        .address
                                                                                        .street
                                                                                }

                                                                                ,{' '}
                                                                                {
                                                                                    order
                                                                                        .address
                                                                                        .houseNumber
                                                                                }
                                                                                {order
                                                                                    .address
                                                                                    .apartment &&
                                                                                    `, кв. ${order.address.apartment}`}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className='mt-4 pt-4 border-t border-gray-200 flex justify-end'>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRepeatOrder(
                                                                                order
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            repeatOrderLoading ===
                                                                            order.id
                                                                        }
                                                                        className={`flex items-center px-4 py-2 ${
                                                                            repeatOrderLoading ===
                                                                            order.id
                                                                                ? 'bg-gray-400 cursor-not-allowed'
                                                                                : 'bg-red-600 hover:bg-red-700'
                                                                        } text-white rounded-md transition-colors`}
                                                                    >
                                                                        {repeatOrderLoading ===
                                                                        order.id ? (
                                                                            <>
                                                                                <span className='mr-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
                                                                                Обработка...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FaRedo className='mr-2' />{' '}
                                                                                Повторить
                                                                                заказ
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
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
                                        )}
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
