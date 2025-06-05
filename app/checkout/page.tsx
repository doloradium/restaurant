'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaCreditCard, FaLock } from 'react-icons/fa';
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

    const CheckoutSchema = Yup.object().shape({
        cardNumber: Yup.string()
            .matches(/^\d{16}$/, 'Номер карты должен содержать 16 цифр')
            .required('Введите номер карты'),
        expiryDate: Yup.string()
            .matches(
                /^(0[1-9]|1[0-2])\/\d{2}$/,
                'Дата должна быть в формате ММ/ГГ'
            )
            .required('Введите срок действия'),
        cvv: Yup.string()
            .matches(/^\d{3,4}$/, 'CVV должен содержать 3 или 4 цифры')
            .required('Введите CVV'),
        name: Yup.string().required('Введите имя владельца карты'),
    });

    const formik = useFormik({
        initialValues: {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            name: '',
        },
        validationSchema: CheckoutSchema,
        onSubmit: async (values) => {
            if (!deliveryAddress || !deliveryTime) {
                toast.error('Please select delivery address and time');
                return;
            }

            setIsProcessing(true);
            try {
                // Get current user ID
                const userResponse = await fetch('/api/auth/me');
                const userData = await userResponse.json();

                if (!userData.user) {
                    toast.error('You must be logged in to place an order');
                    router.push('/login');
                    return;
                }

                // Update user address if needed
                if (deliveryAddress) {
                    await fetch('/api/users/address', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: userData.user.id,
                            street: deliveryAddress.street,
                            house: deliveryAddress.houseNumber,
                            apartment: deliveryAddress.apartment,
                        }),
                    });
                }

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
                        paymentType: 'CARD', // Could make this configurable
                        status: 'PENDING',
                    }),
                });

                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json();
                    throw new Error(
                        errorData.error || 'Failed to create order'
                    );
                }

                // Get the created order
                const orderData = await orderResponse.json();
                console.log('Order created:', orderData);

                // Success
                clearCart();
                router.push('/confirmation');
                toast.success('Order placed successfully!');
            } catch (error) {
                console.error('Error processing order:', error);
                toast.error('Failed to process order. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        },
    });

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

                {/* Payment Information */}
                {checkoutStep === 'payment' && (
                    <form onSubmit={formik.handleSubmit} className='space-y-8'>
                        <div className='bg-white shadow rounded-lg p-6'>
                            <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
                                <FaCreditCard className='mr-2 text-red-600' />
                                Платежная информация
                            </h3>

                            <div className='grid grid-cols-1 gap-6'>
                                <div>
                                    <label
                                        htmlFor='name'
                                        className='block text-sm font-medium text-gray-700 mb-1'
                                    >
                                        Имя на карте
                                    </label>
                                    <input
                                        type='text'
                                        id='name'
                                        {...formik.getFieldProps('name')}
                                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                                    />
                                    {formik.touched.name &&
                                        formik.errors.name && (
                                            <div className='text-red-500 text-sm mt-1'>
                                                {formik.errors.name}
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <label
                                        htmlFor='cardNumber'
                                        className='block text-sm font-medium text-gray-700 mb-1'
                                    >
                                        Номер карты
                                    </label>
                                    <input
                                        type='text'
                                        id='cardNumber'
                                        placeholder='1234 5678 9012 3456'
                                        {...formik.getFieldProps('cardNumber')}
                                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                                    />
                                    {formik.touched.cardNumber &&
                                        formik.errors.cardNumber && (
                                            <div className='text-red-500 text-sm mt-1'>
                                                {formik.errors.cardNumber}
                                            </div>
                                        )}
                                </div>

                                <div className='grid grid-cols-2 gap-4'>
                                    <div>
                                        <label
                                            htmlFor='expiryDate'
                                            className='block text-sm font-medium text-gray-700 mb-1'
                                        >
                                            Срок действия
                                        </label>
                                        <input
                                            type='text'
                                            id='expiryDate'
                                            placeholder='MM/YY'
                                            {...formik.getFieldProps(
                                                'expiryDate'
                                            )}
                                            className='w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                                        />
                                        {formik.touched.expiryDate &&
                                            formik.errors.expiryDate && (
                                                <div className='text-red-500 text-sm mt-1'>
                                                    {formik.errors.expiryDate}
                                                </div>
                                            )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor='cvv'
                                            className='block text-sm font-medium text-gray-700 mb-1'
                                        >
                                            CVV
                                        </label>
                                        <input
                                            type='text'
                                            id='cvv'
                                            placeholder='123'
                                            {...formik.getFieldProps('cvv')}
                                            className='w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                                        />
                                        {formik.touched.cvv &&
                                            formik.errors.cvv && (
                                                <div className='text-red-500 text-sm mt-1'>
                                                    {formik.errors.cvv}
                                                </div>
                                            )}
                                    </div>
                                </div>

                                <div className='text-sm text-gray-500 flex items-center'>
                                    <FaLock className='mr-2' />
                                    Ваши платежные данные защищены
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
                                type='submit'
                                disabled={isProcessing || !formik.isValid}
                                className={`px-8 py-3 rounded-md font-medium transition-colors ${
                                    isProcessing || !formik.isValid
                                        ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                                        : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                            >
                                {isProcessing
                                    ? 'Оформление...'
                                    : 'Оформить заказ'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
