'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState<number | null>(null);

    useEffect(() => {
        // Юкасса может возвращать разные параметры в URL, проверяем все возможные варианты
        const paymentId =
            searchParams.get('payment_id') || searchParams.get('paymentId');
        const orderIdParam =
            searchParams.get('order_id') || searchParams.get('orderId');

        console.log('Получены параметры:', { paymentId, orderIdParam });

        if (!paymentId && !orderIdParam) {
            setError(
                'Недостаточно параметров для проверки платежа. Обратитесь в поддержку.'
            );
            setLoading(false);
            return;
        }

        async function verifyPayment() {
            try {
                // Если есть ID платежа, проверяем статус
                if (paymentId) {
                    // Проверяем статус платежа
                    const statusResponse = await fetch(
                        `/api/payment/yookassa/status?paymentId=${paymentId}`
                    );
                    const statusData = await statusResponse.json();

                    console.log('Статус платежа:', statusData);

                    if (
                        statusResponse.ok &&
                        statusData.status === 'succeeded'
                    ) {
                        // Если есть ID заказа, обновляем его статус
                        if (orderIdParam) {
                            const updateOrderResponse = await fetch(
                                `/api/orders/${orderIdParam}/paid`,
                                {
                                    method: 'PATCH',
                                }
                            );

                            if (updateOrderResponse.ok) {
                                setOrderId(Number(orderIdParam));
                                setSuccess(true);
                            } else {
                                setError('Не удалось обновить статус заказа');
                            }
                        } else {
                            // Если нет ID заказа, но платеж успешный
                            setSuccess(true);
                        }
                    } else {
                        setError('Платеж не был успешно завершен');
                    }
                }
                // Если есть только ID заказа без ID платежа
                else if (orderIdParam) {
                    setOrderId(Number(orderIdParam));
                    setSuccess(true);
                }
            } catch (error) {
                console.error('Error verifying payment:', error);
                setError('Произошла ошибка при проверке платежа');
            } finally {
                setLoading(false);
            }
        }

        verifyPayment();
    }, [searchParams, router]);

    if (loading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <div className='mb-4'>
                        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto'></div>
                    </div>
                    <h2 className='text-xl font-bold text-gray-900'>
                        Проверка платежа...
                    </h2>
                    <p className='mt-2 text-gray-500'>Пожалуйста, подождите</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
                <div className='max-w-3xl mx-auto'>
                    <div className='text-center mb-8'>
                        <FaExclamationCircle className='mx-auto h-12 w-12 text-red-600' />
                        <h2 className='mt-4 text-2xl font-bold text-gray-900'>
                            Ошибка платежа
                        </h2>
                        <p className='mt-2 text-gray-500'>{error}</p>
                    </div>

                    <div className='flex justify-center space-x-4'>
                        <Link
                            href='/checkout'
                            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
                        >
                            Вернуться к оформлению
                        </Link>
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

    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
            <div className='max-w-3xl mx-auto'>
                <div className='text-center mb-8'>
                    <FaCheckCircle className='mx-auto h-12 w-12 text-green-500' />
                    <h2 className='mt-4 text-2xl font-bold text-gray-900'>
                        Оплата успешно выполнена!
                    </h2>
                    <p className='mt-2 text-gray-500'>
                        Ваш заказ #{orderId} успешно оплачен и принят в
                        обработку.
                    </p>
                </div>

                <div className='bg-white shadow rounded-lg p-6 mb-8'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                        Что дальше?
                    </h3>
                    <p className='text-gray-500 mb-4'>
                        Мы начали готовить ваш заказ. Вы можете отслеживать его
                        статус в личном кабинете.
                    </p>
                </div>

                <div className='flex justify-center space-x-4'>
                    <Link
                        href='/profile/orders'
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700'
                    >
                        Мои заказы
                    </Link>
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
