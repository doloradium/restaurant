'use client';

import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';

export default function ConfirmationPage() {
    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
            <div className='max-w-3xl mx-auto'>
                <div className='text-center mb-8'>
                    <FaCheckCircle className='mx-auto h-12 w-12 text-green-500' />
                    <h2 className='mt-4 text-2xl font-bold text-gray-900'>
                        Заказ успешно оформлен!
                    </h2>
                    <p className='mt-2 text-gray-500'>
                        Ваш заказ принят в обработку.
                    </p>
                </div>

                <div className='bg-white shadow rounded-lg p-6 mb-8'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                        Информация о заказе
                    </h3>
                    <p className='text-gray-500 mb-4'>
                        Оплата будет произведена наличными при получении заказа.
                        Курьер свяжется с вами по указанному номеру телефона.
                    </p>
                    <p className='text-gray-500 mb-4'>
                        Мы начали готовить ваш заказ. Вы можете отслеживать его
                        статус в личном кабинете.
                    </p>
                </div>

                <div className='flex justify-center'>
                    <Link
                        href='/'
                        className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                    >
                        На главную
                    </Link>
                </div>
            </div>
        </div>
    );
}
