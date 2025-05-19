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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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

            toast.success('Profile updated successfully!');
            setEditMode(false);
            router.refresh();
        } catch (error) {
            toast.error('Failed to update profile');
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

            toast.success('Logged out successfully');
            router.push('/');
            router.refresh();
        } catch (error) {
            toast.error('Failed to logout');
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
                                                Profile
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
                                                Order History
                                            </button>
                                        </li>
                                        <li>
                                            <Link
                                                href='/'
                                                className='w-full text-left px-4 py-2 rounded-md flex items-center text-gray-700 hover:bg-gray-50'
                                            >
                                                <FaHome className='mr-3' /> Back
                                                to Home
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
                            {activeTab === 'profile' && (
                                <div className='bg-white rounded-lg shadow-sm'>
                                    <div className='p-6 border-b border-gray-200 flex justify-between items-center'>
                                        <h1 className='text-2xl font-bold text-gray-900'>
                                            My Profile
                                        </h1>
                                        {!editMode && (
                                            <button
                                                onClick={() =>
                                                    setEditMode(true)
                                                }
                                                className='flex items-center text-red-600 hover:text-red-700'
                                            >
                                                <FaEdit className='mr-1' /> Edit
                                                Profile
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
                                                            First Name
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
                                                            Last Name
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
                                                            Email Address
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
                                                            Phone Number
                                                        </label>
                                                        <input
                                                            type='tel'
                                                            id='phoneNumber'
                                                            name='phoneNumber'
                                                            value={
                                                                formData.phoneNumber
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                                                        />
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor='street'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Street
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
                                                            House Number
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
                                                            Apartment Number
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
                                                <div className='flex gap-4'>
                                                    <button
                                                        type='submit'
                                                        className='px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200'
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        type='button'
                                                        onClick={() => {
                                                            setEditMode(false);
                                                            setFormData({
                                                                name: user.name,
                                                                surname:
                                                                    user.surname,
                                                                email: user.email,
                                                                phoneNumber:
                                                                    user.phoneNumber,
                                                                street: user.street,
                                                                house: user.house,
                                                                apartment:
                                                                    user.apartment,
                                                            });
                                                        }}
                                                        className='px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200'
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div>
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
                                                                {user.name}{' '}
                                                                {user.surname}
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
                                                                {
                                                                    user.phoneNumber
                                                                }
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
                                                            {user.street}{' '}
                                                            {user.house}
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

                                                <div className='mb-8'>
                                                    <h3 className='text-lg font-medium text-gray-800 mb-4'>
                                                        Account Management
                                                    </h3>
                                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                        <button className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center'>
                                                            <FaLock className='text-red-500 mr-3' />
                                                            <span>
                                                                Change Password
                                                            </span>
                                                        </button>
                                                        <button className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center'>
                                                            <FaCreditCard className='text-red-500 mr-3' />
                                                            <span>
                                                                Manage Payment
                                                                Methods
                                                            </span>
                                                        </button>
                                                    </div>
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
                                            Order History
                                        </h1>
                                    </div>

                                    <div className='p-6'>
                                        <div className='text-center py-8'>
                                            <p className='text-gray-500 mb-4'>
                                                You haven't placed any orders
                                                yet.
                                            </p>
                                            <Link
                                                href='/menu'
                                                className='bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition duration-200'
                                            >
                                                Browse Menu
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
