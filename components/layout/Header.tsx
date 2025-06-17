'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import {
    FaUser,
    FaShoppingCart,
    FaBars,
    FaTimes,
    FaHistory,
    FaAngleDown,
} from 'react-icons/fa';
import { useAuth } from '@/app/AuthProvider';
import { useCart } from '@/app/CartProvider';

export default function Header() {
    const { user, isLoading } = useAuth();
    const { totalItems } = useCart();
    const isLoggedIn = !!user;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsProfileDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Don't show auth buttons while loading
    const renderAuthButtons = () => {
        if (isLoading) {
            return null;
        }

        if (isLoggedIn) {
            return (
                <div className='relative' ref={dropdownRef}>
                    <button
                        onClick={() =>
                            setIsProfileDropdownOpen(!isProfileDropdownOpen)
                        }
                        className='flex items-center text-gray-700 hover:text-red-600 focus:outline-none'
                    >
                        <FaUser className='mr-1' />
                        <span>Профиль</span>
                        <FaAngleDown className='ml-1' />
                    </button>

                    {isProfileDropdownOpen && (
                        <div className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10'>
                            <Link
                                href='/profile'
                                className='block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600'
                                onClick={() => setIsProfileDropdownOpen(false)}
                            >
                                <FaUser className='inline-block mr-2' />
                                Мой профиль
                            </Link>
                            <Link
                                href='/profile/orders'
                                className='block px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600'
                                onClick={() => setIsProfileDropdownOpen(false)}
                            >
                                <FaHistory className='inline-block mr-2' />
                                История заказов
                            </Link>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className='flex items-center space-x-4'>
                <Link
                    href='/login'
                    className='text-gray-700 hover:text-red-600'
                >
                    Вход
                </Link>
                <Link
                    href='/register'
                    className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200'
                >
                    Регистрация
                </Link>
            </div>
        );
    };

    return (
        <header className='bg-white shadow-md'>
            <div className='container mx-auto px-4 py-3'>
                <div className='flex justify-between items-center'>
                    {/* Логотип */}
                    <Link href='/' className='text-2xl font-bold text-red-600'>
                        Ресторан "Mosaic Sushi"
                    </Link>

                    {/* Кнопка мобильного меню */}
                    <button
                        className='lg:hidden text-gray-600 focus:outline-none'
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <FaTimes size={24} />
                        ) : (
                            <FaBars size={24} />
                        )}
                    </button>

                    {/* Десктоп навигация */}
                    <nav className='hidden lg:flex items-center space-x-8'>
                        <Link
                            href='/'
                            className='text-gray-700 hover:text-red-600 transition duration-200'
                        >
                            Главная
                        </Link>
                        <Link
                            href='/menu'
                            className='text-gray-700 hover:text-red-600 transition duration-200'
                        >
                            Меню
                        </Link>
                        <Link
                            href='/about'
                            className='text-gray-700 hover:text-red-600 transition duration-200'
                        >
                            О нас
                        </Link>
                        <Link
                            href='/contact'
                            className='text-gray-700 hover:text-red-600 transition duration-200'
                        >
                            Контакты
                        </Link>
                    </nav>

                    {/* Десктоп вход и корзина */}
                    <div className='hidden lg:flex items-center space-x-6'>
                        {renderAuthButtons()}
                        <Link
                            href='/cart'
                            className='flex items-center text-gray-700 hover:text-red-600 relative'
                        >
                            <FaShoppingCart size={20} />
                            {totalItems > 0 && (
                                <span className='absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full'>
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Мобильное меню */}
                {isMenuOpen && (
                    <div className='lg:hidden mt-4 bg-white pb-4'>
                        <nav className='flex flex-col space-y-3'>
                            <Link
                                href='/'
                                className='text-gray-700 hover:text-red-600 transition duration-200 py-2'
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Главная
                            </Link>
                            <Link
                                href='/menu'
                                className='text-gray-700 hover:text-red-600 transition duration-200 py-2'
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Меню
                            </Link>
                            <Link
                                href='/about'
                                className='text-gray-700 hover:text-red-600 transition duration-200 py-2'
                                onClick={() => setIsMenuOpen(false)}
                            >
                                О нас
                            </Link>
                            <Link
                                href='/contact'
                                className='text-gray-700 hover:text-red-600 transition duration-200 py-2'
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Контакты
                            </Link>
                            <hr className='border-gray-200' />
                            {!isLoading &&
                                (isLoggedIn ? (
                                    <>
                                        <Link
                                            href='/profile'
                                            className='flex items-center text-gray-700 hover:text-red-600 py-2'
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FaUser className='mr-2' />
                                            <span>Мой профиль</span>
                                        </Link>
                                        <Link
                                            href='/profile/orders'
                                            className='flex items-center text-gray-700 hover:text-red-600 py-2'
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FaHistory className='mr-2' />
                                            <span>История заказов</span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href='/login'
                                            className='text-gray-700 hover:text-red-600 py-2'
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Вход
                                        </Link>
                                        <Link
                                            href='/register'
                                            className='text-gray-700 hover:text-red-600 py-2'
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Регистрация
                                        </Link>
                                    </>
                                ))}
                            <Link
                                href='/cart'
                                className='flex items-center text-gray-700 hover:text-red-600 py-2'
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <FaShoppingCart className='mr-2' />
                                <span>
                                    Корзина{' '}
                                    {totalItems > 0 && `(${totalItems})`}
                                </span>
                            </Link>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
