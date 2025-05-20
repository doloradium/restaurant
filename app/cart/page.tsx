'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import { useCart } from '../CartProvider';
import Link from 'next/link';

const CartPage = () => {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();

    if (cart.length === 0) {
        return (
            <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
                <div className='max-w-3xl mx-auto text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                        Ваша корзина пуста
                    </h2>
                    <p className='text-gray-600 mb-8'>
                        Добавьте вкусные блюда в корзину, чтобы сделать заказ!
                    </p>
                    <Link
                        href='/menu'
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        Смотреть меню
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
            <div className='max-w-3xl mx-auto'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>
                    Ваша корзина
                </h2>

                <div className='bg-white shadow rounded-lg divide-y divide-gray-200'>
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className='p-6 flex items-center space-x-4'
                        >
                            <div className='flex-shrink-0 w-24 h-24 relative'>
                                {item.image ? (
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className='rounded-lg object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full bg-gray-200 rounded-lg flex items-center justify-center'>
                                        <span className='text-gray-500 text-xs'>
                                            Нет изображения
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className='flex-1 min-w-0'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    {item.name}
                                </h3>
                                <p className='text-sm text-gray-500'>
                                    {item.description}
                                </p>
                                <p className='text-lg font-medium text-red-600 mt-1'>
                                    ${item.price.toFixed(2)}
                                </p>
                            </div>

                            <div className='flex items-center space-x-3'>
                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity - 1
                                        )
                                    }
                                    className='text-gray-400 hover:text-gray-500'
                                >
                                    <FaMinus />
                                </button>
                                <span className='text-gray-900 font-medium'>
                                    {item.quantity}
                                </span>
                                <button
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity + 1
                                        )
                                    }
                                    className='text-gray-400 hover:text-gray-500'
                                >
                                    <FaPlus />
                                </button>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className='text-gray-400 hover:text-red-500'
                            >
                                <FaTrash />
                            </button>
                        </div>
                    ))}
                </div>

                <div className='mt-8 bg-white shadow rounded-lg p-6'>
                    <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Итого
                        </h3>
                        <span className='text-xl font-bold text-red-600'>
                            ${totalPrice.toFixed(2)}
                        </span>
                    </div>

                    <button
                        onClick={() => router.push('/checkout')}
                        className='w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        Перейти к оформлению
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
