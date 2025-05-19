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
    FaShoppingCart,
    FaUtensils,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    street: string;
    house: string;
    apartment: string;
    role: string;
    rating: number;
}

interface CustomerDashboardProps {
    user: User;
}

export default function CustomerDashboard({ user }: CustomerDashboardProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to logout');
            }

            toast.success('Logged out successfully');
            router.push('/');
            router.refresh();
        } catch (error) {
            toast.error('Failed to logout');
            console.error('Error logging out:', error);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-12'>
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
                                                    setActiveTab('dashboard')
                                                }
                                                className={`w-full text-left px-4 py-2 rounded-md flex items-center ${
                                                    activeTab === 'dashboard'
                                                        ? 'bg-red-50 text-red-600'
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <FaHome className='mr-3' />{' '}
                                                Dashboard
                                            </button>
                                        </li>
                                        <li>
                                            <Link
                                                href='/menu'
                                                className='w-full text-left px-4 py-2 rounded-md flex items-center text-gray-700 hover:bg-gray-50'
                                            >
                                                <FaUtensils className='mr-3' />{' '}
                                                Menu
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href='/customer/cart'
                                                className='w-full text-left px-4 py-2 rounded-md flex items-center text-gray-700 hover:bg-gray-50'
                                            >
                                                <FaShoppingCart className='mr-3' />{' '}
                                                Cart
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href='/customer/orders'
                                                className='w-full text-left px-4 py-2 rounded-md flex items-center text-gray-700 hover:bg-gray-50'
                                            >
                                                <FaHistory className='mr-3' />{' '}
                                                Order History
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href='/customer/profile'
                                                className='w-full text-left px-4 py-2 rounded-md flex items-center text-gray-700 hover:bg-gray-50'
                                            >
                                                <FaUser className='mr-3' />{' '}
                                                Profile
                                            </Link>
                                        </li>
                                        <li>
                                            <button
                                                onClick={handleLogout}
                                                className='w-full text-left px-4 py-2 rounded-md flex items-center text-red-600 hover:bg-red-50'
                                            >
                                                <FaSignOutAlt className='mr-3' />{' '}
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className='flex-1'>
                            <div className='bg-white rounded-lg shadow-sm'>
                                <div className='p-6 border-b border-gray-200'>
                                    <h1 className='text-2xl font-bold text-gray-900'>
                                        Welcome, {user.name}!
                                    </h1>
                                </div>

                                <div className='p-6'>
                                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <div className='flex items-center mb-3'>
                                                <FaUser className='text-red-500 mr-2' />
                                                <h3 className='font-medium text-gray-800'>
                                                    Account Info
                                                </h3>
                                            </div>
                                            <div className='space-y-2'>
                                                <p className='text-sm text-gray-600'>
                                                    <span className='font-medium'>
                                                        Name:
                                                    </span>{' '}
                                                    {user.name} {user.surname}
                                                </p>
                                                <p className='text-sm text-gray-600'>
                                                    <span className='font-medium'>
                                                        Email:
                                                    </span>{' '}
                                                    {user.email}
                                                </p>
                                                <p className='text-sm text-gray-600'>
                                                    <span className='font-medium'>
                                                        Phone:
                                                    </span>{' '}
                                                    {user.phoneNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <div className='flex items-center mb-3'>
                                                <FaMapMarkerAlt className='text-red-500 mr-2' />
                                                <h3 className='font-medium text-gray-800'>
                                                    Delivery Address
                                                </h3>
                                            </div>
                                            <p className='text-sm text-gray-600'>
                                                {user.street} {user.house}
                                                {user.apartment
                                                    ? `, Apt ${user.apartment}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <div className='bg-gray-50 p-4 rounded-lg'>
                                            <div className='flex items-center mb-3'>
                                                <FaHistory className='text-red-500 mr-2' />
                                                <h3 className='font-medium text-gray-800'>
                                                    Account Status
                                                </h3>
                                            </div>
                                            <div className='space-y-2'>
                                                <p className='text-sm text-gray-600'>
                                                    <span className='font-medium'>
                                                        Role:
                                                    </span>{' '}
                                                    {user.role}
                                                </p>
                                                <p className='text-sm text-gray-600'>
                                                    <span className='font-medium'>
                                                        Rating:
                                                    </span>{' '}
                                                    {user.rating}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        <Link
                                            href='/menu'
                                            className='p-6 bg-red-50 rounded-lg hover:bg-red-100 transition duration-200'
                                        >
                                            <div className='flex items-center mb-3'>
                                                <FaUtensils className='text-red-500 mr-2 text-xl' />
                                                <h3 className='font-medium text-gray-800 text-lg'>
                                                    Browse Menu
                                                </h3>
                                            </div>
                                            <p className='text-gray-600'>
                                                Explore our delicious menu and
                                                place your order
                                            </p>
                                        </Link>
                                        <Link
                                            href='/customer/orders'
                                            className='p-6 bg-red-50 rounded-lg hover:bg-red-100 transition duration-200'
                                        >
                                            <div className='flex items-center mb-3'>
                                                <FaHistory className='text-red-500 mr-2 text-xl' />
                                                <h3 className='font-medium text-gray-800 text-lg'>
                                                    View Orders
                                                </h3>
                                            </div>
                                            <p className='text-gray-600'>
                                                Check your order history and
                                                track current orders
                                            </p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
