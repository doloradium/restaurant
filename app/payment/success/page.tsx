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
    const [orderStatus, setOrderStatus] = useState<string | null>(null);
    const [checkAttempts, setCheckAttempts] = useState(0);

    // Function to check order status
    const checkOrderStatus = async (orderId: string) => {
        try {
            console.log(`Checking status for order ${orderId}`);
            const response = await fetch(`/api/orders/${orderId}`);

            if (!response.ok) {
                console.error(`Error fetching order ${orderId}`);
                return null;
            }

            const orderData = await response.json();
            console.log(
                `Order ${orderId} status:`,
                orderData.status,
                'isPaid:',
                orderData.isPaid
            );
            return orderData;
        } catch (error) {
            console.error('Error checking order status:', error);
            return null;
        }
    };

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

        // Set order ID from parameters
        if (orderIdParam) {
            setOrderId(Number(orderIdParam));
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

                    console.log('Статус платежа от Юкассы:', statusData);

                    if (
                        statusResponse.ok &&
                        (statusData.status === 'succeeded' ||
                            statusData.status === 'waiting_for_capture')
                    ) {
                        // Если есть ID заказа, обновляем его статус
                        if (orderIdParam) {
                            console.log(
                                'Updating order status for order:',
                                orderIdParam
                            );

                            try {
                                // First check current order status
                                const orderData = await checkOrderStatus(
                                    orderIdParam
                                );

                                if (
                                    orderData &&
                                    orderData.status !== 'CONFIRMED'
                                ) {
                                    console.log(
                                        'Order needs status update. Current status:',
                                        orderData.status
                                    );

                                    // Mark the order as paid
                                    const updateOrderResponse = await fetch(
                                        `/api/orders/${orderIdParam}/paid`,
                                        {
                                            method: 'PATCH',
                                            headers: {
                                                'Content-Type':
                                                    'application/json',
                                            },
                                        }
                                    );

                                    const updatedOrder =
                                        await updateOrderResponse.json();
                                    console.log(
                                        'Order update response:',
                                        updatedOrder
                                    );

                                    // Set order status from response
                                    if (updatedOrder && updatedOrder.status) {
                                        setOrderStatus(updatedOrder.status);
                                    }

                                    if (updateOrderResponse.ok) {
                                        setOrderId(Number(orderIdParam));
                                        setSuccess(true);
                                    } else {
                                        console.error(
                                            'Failed to update order status:',
                                            updatedOrder
                                        );
                                        // Even if the update fails, show success to the user
                                        // The webhook from Yookassa will likely update the status later
                                        setOrderId(Number(orderIdParam));
                                        setSuccess(true);
                                        setError('');
                                    }
                                } else {
                                    console.log(
                                        'Order already in CONFIRMED status, no update needed'
                                    );
                                    // Order is already confirmed
                                    setOrderId(Number(orderIdParam));
                                    setOrderStatus(orderData?.status || null);
                                    setSuccess(true);
                                }
                            } catch (err) {
                                console.error(
                                    'Error during order status update:',
                                    err
                                );
                                // Still show success to the user despite the error
                                setOrderId(Number(orderIdParam));
                                setSuccess(true);
                            }
                        } else {
                            // Если нет ID заказа, но платеж успешный
                            setSuccess(true);
                        }
                    } else if (statusData.status === 'canceled') {
                        setError('Платеж был отменен');
                    } else {
                        setError('Платеж не был успешно завершен');
                    }
                }
                // Если есть только ID заказа без ID платежа
                else if (orderIdParam) {
                    console.log(
                        `Only order ID ${orderIdParam} received, no payment ID. Checking order status directly.`
                    );

                    // Check order status directly
                    const orderData = await checkOrderStatus(orderIdParam);

                    if (orderData) {
                        console.log(
                            `Initial order status check: ${JSON.stringify(
                                orderData
                            )}`
                        );
                        setOrderStatus(orderData.status);

                        // Check if order needs to be updated to CONFIRMED (regardless of isPaid)
                        if (orderData.status !== 'CONFIRMED') {
                            try {
                                console.log(
                                    `Order ${orderIdParam} status is still ${orderData.status}, updating to CONFIRMED`
                                );
                                const updateResponse = await fetch(
                                    `/api/orders/${orderIdParam}/paid`,
                                    {
                                        method: 'PATCH',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    }
                                );

                                const updatedData = await updateResponse.json();
                                console.log(
                                    `Manual status update response:`,
                                    updatedData
                                );

                                if (updatedData && updatedData.status) {
                                    setOrderStatus(updatedData.status);
                                }
                            } catch (err) {
                                console.error(
                                    'Error updating order status manually:',
                                    err
                                );
                            }
                        }

                        // Show success regardless if order exists
                        setSuccess(true);
                    } else {
                        console.log(`Could not find order ${orderIdParam}`);
                        setError('Заказ не найден');
                    }

                    setOrderId(Number(orderIdParam));
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

    // Periodically check order status if we have an order ID and it's not CONFIRMED yet
    useEffect(() => {
        if (
            !orderId ||
            loading ||
            checkAttempts >= 10 ||
            orderStatus === 'CONFIRMED'
        ) {
            return;
        }

        const intervalId = setInterval(async () => {
            if (orderId) {
                const orderData = await checkOrderStatus(orderId.toString());
                if (orderData) {
                    const newStatus = orderData.status;

                    console.log(
                        `Polling: Order ${orderId} status: ${newStatus}, isPaid: ${orderData.isPaid}`
                    );
                    setOrderStatus(newStatus);

                    // If status is still PENDING but it should be CONFIRMED, try to update it manually
                    if (newStatus === 'PENDING') {
                        try {
                            console.log(
                                'Attempting to manually update order status to CONFIRMED'
                            );
                            const updateResponse = await fetch(
                                `/api/orders/${orderId}/paid`,
                                {
                                    method: 'PATCH',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                }
                            );

                            if (updateResponse.ok) {
                                const updatedData = await updateResponse.json();
                                console.log(
                                    'Manual update successful:',
                                    updatedData
                                );
                                setOrderStatus(updatedData.status);
                            }
                        } catch (err) {
                            console.error(
                                'Error in manual status update:',
                                err
                            );
                        }
                    }

                    // If status is now CONFIRMED, we can stop checking
                    if (newStatus === 'CONFIRMED') {
                        console.log('Order is now CONFIRMED, stopping polling');
                        clearInterval(intervalId);
                    }
                }
            }

            setCheckAttempts((prev) => prev + 1);

            // Stop checking after 10 attempts (50 seconds)
            if (checkAttempts >= 9) {
                console.log('Max polling attempts reached, stopping');
                clearInterval(intervalId);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(intervalId);
    }, [orderId, loading, orderStatus, checkAttempts]);

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
                    <p className='mt-2 text-sm text-gray-500'>
                        {orderStatus === 'CONFIRMED'
                            ? 'Заказ подтвержден и передан на кухню.'
                            : 'Статус вашего заказа будет обновлен автоматически после подтверждения платежа.'}
                    </p>
                </div>

                <div className='bg-white shadow rounded-lg p-6 mb-8'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                        Что дальше?
                    </h3>
                    <p className='text-gray-500 mb-4'>
                        {orderStatus === 'CONFIRMED'
                            ? 'Мы начали готовить ваш заказ. Вы можете отслеживать его статус в личном кабинете.'
                            : 'Мы начнем готовить ваш заказ после подтверждения платежа. Вы можете отслеживать его статус в личном кабинете.'}
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
