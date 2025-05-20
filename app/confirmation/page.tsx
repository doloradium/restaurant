'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaHome, FaShoppingCart } from 'react-icons/fa';
import { useDelivery } from '../DeliveryProvider';
import { format } from 'date-fns';

export default function ConfirmationPage() {
    const { deliveryAddress, deliveryTime } = useDelivery();

    // If there's no delivery info, it likely means the user navigated directly to this page
    if (!deliveryAddress || !deliveryTime) {
        return (
            <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center'>
                <div className='max-w-md w-full space-y-8 text-center'>
                    <div>
                        <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
                            No order information found
                        </h2>
                        <p className='mt-2 text-sm text-gray-600'>
                            It looks like you've reached this page directly.
                            Please place an order to see confirmation details.
                        </p>
                    </div>
                    <div className='mt-6'>
                        <Link
                            href='/menu'
                            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                        >
                            Browse Menu
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto'>
                <div className='text-center mb-12'>
                    <FaCheckCircle className='mx-auto h-16 w-16 text-green-500' />
                    <h2 className='mt-6 text-3xl font-bold text-gray-900'>
                        Заказ принят!
                    </h2>
                    <p className='mt-2 text-lg text-gray-600'>
                        Спасибо за ваш заказ! Он был успешно оформлен и сейчас
                        обрабатывается.
                    </p>
                </div>

                {/* Order Details */}
                <div className='bg-white shadow overflow-hidden sm:rounded-lg mb-8'>
                    <div className='px-4 py-5 sm:px-6'>
                        <h3 className='text-lg leading-6 font-medium text-gray-900'>
                            Детали заказа
                        </h3>
                    </div>
                    <div className='border-t border-gray-200'>
                        <dl>
                            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                                <dt className='text-sm font-medium text-gray-500'>
                                    Номер заказа
                                </dt>
                                <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                                    {/* Generate a random order number */}#
                                    {Math.floor(Math.random() * 1000000)
                                        .toString()
                                        .padStart(6, '0')}
                                </dd>
                            </div>
                            <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                                <dt className='text-sm font-medium text-gray-500'>
                                    Дата заказа
                                </dt>
                                <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                                    {format(new Date(), 'dd MMMM yyyy, HH:mm')}
                                </dd>
                            </div>
                            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                                <dt className='text-sm font-medium text-gray-500'>
                                    Адрес доставки
                                </dt>
                                <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                                    {deliveryAddress.fullAddress}
                                    {(deliveryAddress.apartment ||
                                        deliveryAddress.floor ||
                                        deliveryAddress.entrance) && (
                                        <p className='text-gray-600 mt-1'>
                                            {[
                                                deliveryAddress.apartment &&
                                                    `Кв: ${deliveryAddress.apartment}`,
                                                deliveryAddress.floor &&
                                                    `Этаж: ${deliveryAddress.floor}`,
                                                deliveryAddress.entrance &&
                                                    `Подъезд: ${deliveryAddress.entrance}`,
                                                deliveryAddress.intercom &&
                                                    `Домофон: ${deliveryAddress.intercom}`,
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                    )}
                                </dd>
                            </div>
                            <div className='bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                                <dt className='text-sm font-medium text-gray-500'>
                                    Время доставки
                                </dt>
                                <dd className='mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2'>
                                    {format(
                                        new Date(deliveryTime.date),
                                        'dd MMMM yyyy'
                                    )}
                                    , {deliveryTime.timeSlot}
                                </dd>
                            </div>
                            <div className='bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'>
                                <dt className='text-sm font-medium text-gray-500'>
                                    Статус
                                </dt>
                                <dd className='mt-1 text-sm text-green-600 font-medium sm:mt-0 sm:col-span-2'>
                                    Подтвержден
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Next Steps / Information */}
                <div className='bg-white shadow sm:rounded-lg'>
                    <div className='px-4 py-5 sm:p-6'>
                        <h3 className='text-lg leading-6 font-medium text-gray-900'>
                            Что дальше?
                        </h3>
                        <div className='mt-5'>
                            <div className='rounded-md bg-green-50 p-4 mb-4'>
                                <div className='flex'>
                                    <div className='ml-3'>
                                        <p className='text-sm font-medium text-green-800'>
                                            Вы получите SMS-уведомление, когда
                                            курьер будет в пути.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className='text-sm text-gray-500'>
                                В случае вопросов, пожалуйста, свяжитесь с нами
                                по телефону{' '}
                                <span className='font-medium'>
                                    +7 (XXX) XXX-XX-XX
                                </span>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className='mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
                    <Link
                        href='/'
                        className='flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        <FaHome className='mr-2' /> На главную
                    </Link>
                    <Link
                        href='/menu'
                        className='flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        <FaShoppingCart className='mr-2' /> Заказать еще
                    </Link>
                </div>
            </div>
        </div>
    );
}
