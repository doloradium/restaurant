'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '../CartProvider';
import { useDelivery } from '../DeliveryProvider';
import AddressSelection from '@/components/checkout/AddressSelection';
import DeliveryTimeSelection from '@/components/checkout/DeliveryTimeSelection';
import DeliveryInfo from '@/components/checkout/DeliveryInfo';

const CheckoutPage = () => {
    const router = useRouter();
    const { cart, totalPrice, clearCart } = useCart();
    const { deliveryAddress, deliveryTime } = useDelivery();
    const [isProcessing, setIsProcessing] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<
        'address' | 'time' | 'payment'
    >(deliveryAddress ? (deliveryTime ? 'payment' : 'time') : 'address');
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');

    const handlePaymentMethodChange = (method: 'CARD' | 'CASH') => {
        setPaymentMethod(method);
    };

    const handleSubmitOrder = async () => {
        if (isProcessing) return; // Предотвращаем повторные нажатия

        if (!deliveryAddress || !deliveryTime) {
            toast.error('Выберите адрес и время доставки');
            return;
        }

        setIsProcessing(true);
        try {
            // Get current user ID
            const userResponse = await fetch('/api/auth/me');
            const userData = await userResponse.json();

            if (!userData.user) {
                toast.error('Вы должны авторизоваться для оформления заказа');
                router.push('/login');
                return;
            }

            // Создаем запись адреса, если его еще нет в базе
            let addressResponse;
            if (deliveryAddress) {
                addressResponse = await fetch('/api/addresses', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userData.user.id,
                        city: deliveryAddress.city,
                        street: deliveryAddress.street,
                        houseNumber: deliveryAddress.houseNumber,
                        apartment: deliveryAddress.apartment,
                        entrance: deliveryAddress.entrance,
                        floor: deliveryAddress.floor,
                        intercom: deliveryAddress.intercom,
                    }),
                });

                if (!addressResponse.ok) {
                    throw new Error('Не удалось сохранить адрес доставки');
                }
            }

            const addressData = addressResponse
                ? await addressResponse.json()
                : null;

            // Преобразуем объект времени доставки в строку ISO
            const deliveryDateTime = deliveryTime
                ? new Date(
                      deliveryTime.date.getFullYear(),
                      deliveryTime.date.getMonth(),
                      deliveryTime.date.getDate(),
                      parseInt(deliveryTime.timeSlot.split(':')[0]),
                      parseInt(deliveryTime.timeSlot.split(':')[1])
                  ).toISOString()
                : null;

            // Create order in database
            const orderResponse = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userData.user.id,
                    items: cart.map((item) => ({
                        itemId: item.id,
                        quantity: item.quantity,
                    })),
                    addressId: addressData.id,
                    deliveryTime: deliveryDateTime,
                    paymentType: paymentMethod,
                    status: 'PENDING',
                    isPaid: paymentMethod === 'CASH', // Если оплата наличными, заказ не требует онлайн-оплаты
                }),
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                throw new Error(errorData.error || 'Failed to create order');
            }

            // Get the created order
            const orderData = await orderResponse.json();
            console.log('Order created:', orderData);

            if (paymentMethod === 'CASH') {
                // Если выбрана оплата наличными, просто перенаправляем на страницу подтверждения
                clearCart();
                router.push('/confirmation');
                toast.success('Заказ успешно оформлен!');
            } else {
                // Если выбрана оплата картой, создаем платеж в Юкассе
                const paymentResponse = await fetch(
                    '/api/payment/yookassa/create',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            amount: totalPrice,
                            returnUrl: `${window.location.origin}/payment/success?orderId=${orderData.id}`,
                            description: `Заказ №${orderData.id}`,
                            metadata: {
                                orderId: orderData.id,
                            },
                        }),
                    }
                );

                if (!paymentResponse.ok) {
                    const errorData = await paymentResponse.json();
                    throw new Error(
                        errorData.error || 'Не удалось создать платеж'
                    );
                }

                const paymentData = await paymentResponse.json();

                // Очищаем корзину и перенаправляем на страницу оплаты Юкассы
                clearCart();
                window.location.href =
                    paymentData.confirmation.confirmation_url;
            }
        } catch (error) {
            console.error('Error processing order:', error);
            toast.error(
                'Не удалось обработать заказ. Пожалуйста, попробуйте еще раз.'
            );
        } finally {
            setIsProcessing(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
                <div className='max-w-3xl mx-auto text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                        Ваша корзина пуста
                    </h2>
                    <p className='text-gray-600 mb-8'>
                        Добавьте блюда в корзину перед оформлением заказа!
                    </p>
                    <button
                        onClick={() => router.push('/menu')}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        Перейти в меню
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
            <div className='max-w-3xl mx-auto'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>
                    Оформление заказа
                </h2>

                {/* Order Summary */}
                <div className='bg-white shadow rounded-lg p-6 mb-8'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                        Ваш заказ
                    </h3>
                    <div className='space-y-4'>
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className='flex justify-between items-center'
                            >
                                <div>
                                    <p className='text-gray-900 font-medium'>
                                        {item.name}
                                    </p>
                                    <p className='text-gray-500 text-sm'>
                                        Количество: {item.quantity}
                                    </p>
                                </div>
                                <p className='text-gray-900 font-medium'>
                                    ₽{(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                        <div className='border-t border-gray-200 pt-4'>
                            <div className='flex justify-between items-center'>
                                <p className='text-lg font-medium text-gray-900'>
                                    Итого
                                </p>
                                <p className='text-2xl font-bold text-red-600'>
                                    ₽{totalPrice.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delivery Information Summary (if already selected) */}
                {(deliveryAddress || deliveryTime) && (
                    <DeliveryInfo
                        onEditAddress={() => setCheckoutStep('address')}
                        onEditTime={() => setCheckoutStep('time')}
                    />
                )}

                {/* Address Selection */}
                {checkoutStep === 'address' && (
                    <div className='mb-8'>
                        <AddressSelection />

                        <div className='mt-6 flex justify-end'>
                            <button
                                onClick={() => setCheckoutStep('time')}
                                disabled={!deliveryAddress}
                                className={`px-6 py-3 rounded-md font-medium ${
                                    deliveryAddress
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                )}

                {/* Time Selection */}
                {checkoutStep === 'time' && (
                    <div className='mb-8'>
                        <DeliveryTimeSelection />

                        <div className='mt-6 flex justify-between'>
                            <button
                                onClick={() => setCheckoutStep('address')}
                                className='px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300'
                            >
                                Назад
                            </button>

                            <button
                                onClick={() => setCheckoutStep('payment')}
                                disabled={!deliveryTime}
                                className={`px-6 py-3 rounded-md font-medium ${
                                    deliveryTime
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                Продолжить
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Method Selection */}
                {checkoutStep === 'payment' && (
                    <div className='space-y-8'>
                        <div className='bg-white shadow rounded-lg p-6'>
                            <h3 className='text-lg font-medium text-gray-900 mb-6'>
                                Способ оплаты
                            </h3>

                            {/* Payment Method Selection */}
                            <div className='space-y-4 mb-6'>
                                <div
                                    className={`p-4 border rounded-lg cursor-pointer flex items-center ${
                                        paymentMethod === 'CARD'
                                            ? 'border-red-600 bg-red-50'
                                            : 'border-gray-300'
                                    }`}
                                    onClick={() =>
                                        handlePaymentMethodChange('CARD')
                                    }
                                >
                                    <div
                                        className='w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 shrink-0'
                                        style={{
                                            borderColor:
                                                paymentMethod === 'CARD'
                                                    ? '#dc2626'
                                                    : '#d1d5db',
                                        }}
                                    >
                                        {paymentMethod === 'CARD' && (
                                            <div className='w-3 h-3 bg-red-600 rounded-full'></div>
                                        )}
                                    </div>
                                    <div className='flex items-center'>
                                        <FaCreditCard className='text-xl mr-2 text-red-600' />
                                        <div>
                                            <p className='font-medium'>
                                                Банковская карта
                                            </p>
                                            <p className='text-sm text-gray-500'>
                                                Онлайн-оплата через Юкассу
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`p-4 border rounded-lg cursor-pointer flex items-center ${
                                        paymentMethod === 'CASH'
                                            ? 'border-red-600 bg-red-50'
                                            : 'border-gray-300'
                                    }`}
                                    onClick={() =>
                                        handlePaymentMethodChange('CASH')
                                    }
                                >
                                    <div
                                        className='w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 shrink-0'
                                        style={{
                                            borderColor:
                                                paymentMethod === 'CASH'
                                                    ? '#dc2626'
                                                    : '#d1d5db',
                                        }}
                                    >
                                        {paymentMethod === 'CASH' && (
                                            <div className='w-3 h-3 bg-red-600 rounded-full'></div>
                                        )}
                                    </div>
                                    <div className='flex items-center'>
                                        <FaMoneyBillWave className='text-xl mr-2 text-green-600' />
                                        <div>
                                            <p className='font-medium'>
                                                Наличными при получении
                                            </p>
                                            <p className='text-sm text-gray-500'>
                                                Оплата курьеру
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-between'>
                            <button
                                type='button'
                                onClick={() => setCheckoutStep('time')}
                                className='px-6 py-3 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300'
                            >
                                Назад
                            </button>

                            <button
                                onClick={handleSubmitOrder}
                                disabled={isProcessing}
                                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                                    isProcessing
                                        ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                                {isProcessing
                                    ? 'Оформление...'
                                    : paymentMethod === 'CARD'
                                    ? 'Оплатить онлайн'
                                    : 'Оформить заказ'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
