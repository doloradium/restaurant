'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaCreditCard, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

const CheckoutPage = () => {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await fetch('/api/cart', {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setCart(data);
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
                toast.error('Failed to load cart');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCart();
    }, []);

    const CheckoutSchema = Yup.object().shape({
        cardNumber: Yup.string()
            .matches(/^\d{16}$/, 'Card number must be 16 digits')
            .required('Card number is required'),
        expiryDate: Yup.string()
            .matches(
                /^(0[1-9]|1[0-2])\/\d{2}$/,
                'Expiry date must be in MM/YY format'
            )
            .required('Expiry date is required'),
        cvv: Yup.string()
            .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
            .required('CVV is required'),
        name: Yup.string().required('Name is required'),
        address: Yup.string().required('Address is required'),
        city: Yup.string().required('City is required'),
        state: Yup.string().required('State is required'),
        zipCode: Yup.string()
            .matches(/^\d{5}$/, 'ZIP code must be 5 digits')
            .required('ZIP code is required'),
    });

    const formik = useFormik({
        initialValues: {
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            name: '',
            address: '',
            city: '',
            state: '',
            zipCode: '',
        },
        validationSchema: CheckoutSchema,
        onSubmit: async (values) => {
            setIsProcessing(true);
            try {
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        items: cart,
                        shippingAddress: {
                            name: values.name,
                            address: values.address,
                            city: values.city,
                            state: values.state,
                            zipCode: values.zipCode,
                        },
                        paymentInfo: {
                            cardNumber: values.cardNumber,
                            expiryDate: values.expiryDate,
                            cvv: values.cvv,
                        },
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    router.push(`/confirmation/${data.orderId}`);
                } else {
                    const error = await response.json();
                    toast.error(error.message || 'Failed to process order');
                }
            } catch (error) {
                console.error('Error processing order:', error);
                toast.error('Failed to process order');
            } finally {
                setIsProcessing(false);
            }
        },
    });

    const calculateTotal = () => {
        return cart.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500'></div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
                <div className='max-w-3xl mx-auto text-center'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                        Your cart is empty
                    </h2>
                    <p className='text-gray-600 mb-8'>
                        Add some items to your cart before checking out!
                    </p>
                    <button
                        onClick={() => router.push('/menu')}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        Browse Menu
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
            <div className='max-w-3xl mx-auto'>
                <h2 className='text-2xl font-bold text-gray-900 mb-8'>
                    Checkout
                </h2>

                <div className='bg-white shadow rounded-lg p-6 mb-8'>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                        Order Summary
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
                                        Quantity: {item.quantity}
                                    </p>
                                </div>
                                <p className='text-gray-900 font-medium'>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                        <div className='border-t border-gray-200 pt-4'>
                            <div className='flex justify-between items-center'>
                                <p className='text-lg font-medium text-gray-900'>
                                    Total
                                </p>
                                <p className='text-2xl font-bold text-red-600'>
                                    ${calculateTotal().toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={formik.handleSubmit} className='space-y-8'>
                    <div className='bg-white shadow rounded-lg p-6'>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>
                            Payment Information
                        </h3>
                        <div className='space-y-4'>
                            <div>
                                <label
                                    htmlFor='cardNumber'
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Card Number
                                </label>
                                <div className='mt-1 relative'>
                                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                        <FaCreditCard className='text-gray-400' />
                                    </div>
                                    <input
                                        id='cardNumber'
                                        type='text'
                                        className='appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                        placeholder='1234 5678 9012 3456'
                                        {...formik.getFieldProps('cardNumber')}
                                    />
                                </div>
                                {formik.touched.cardNumber &&
                                    formik.errors.cardNumber && (
                                        <p className='mt-1 text-sm text-red-600'>
                                            {formik.errors.cardNumber}
                                        </p>
                                    )}
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label
                                        htmlFor='expiryDate'
                                        className='block text-sm font-medium text-gray-700'
                                    >
                                        Expiry Date
                                    </label>
                                    <input
                                        id='expiryDate'
                                        type='text'
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                        placeholder='MM/YY'
                                        {...formik.getFieldProps('expiryDate')}
                                    />
                                    {formik.touched.expiryDate &&
                                        formik.errors.expiryDate && (
                                            <p className='mt-1 text-sm text-red-600'>
                                                {formik.errors.expiryDate}
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label
                                        htmlFor='cvv'
                                        className='block text-sm font-medium text-gray-700'
                                    >
                                        CVV
                                    </label>
                                    <input
                                        id='cvv'
                                        type='text'
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                        placeholder='123'
                                        {...formik.getFieldProps('cvv')}
                                    />
                                    {formik.touched.cvv &&
                                        formik.errors.cvv && (
                                            <p className='mt-1 text-sm text-red-600'>
                                                {formik.errors.cvv}
                                            </p>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='bg-white shadow rounded-lg p-6'>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>
                            Shipping Information
                        </h3>
                        <div className='space-y-4'>
                            <div>
                                <label
                                    htmlFor='name'
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Full Name
                                </label>
                                <input
                                    id='name'
                                    type='text'
                                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    {...formik.getFieldProps('name')}
                                />
                                {formik.touched.name && formik.errors.name && (
                                    <p className='mt-1 text-sm text-red-600'>
                                        {formik.errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor='address'
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Address
                                </label>
                                <input
                                    id='address'
                                    type='text'
                                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    {...formik.getFieldProps('address')}
                                />
                                {formik.touched.address &&
                                    formik.errors.address && (
                                        <p className='mt-1 text-sm text-red-600'>
                                            {formik.errors.address}
                                        </p>
                                    )}
                            </div>

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label
                                        htmlFor='city'
                                        className='block text-sm font-medium text-gray-700'
                                    >
                                        City
                                    </label>
                                    <input
                                        id='city'
                                        type='text'
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                        {...formik.getFieldProps('city')}
                                    />
                                    {formik.touched.city &&
                                        formik.errors.city && (
                                            <p className='mt-1 text-sm text-red-600'>
                                                {formik.errors.city}
                                            </p>
                                        )}
                                </div>

                                <div>
                                    <label
                                        htmlFor='state'
                                        className='block text-sm font-medium text-gray-700'
                                    >
                                        State
                                    </label>
                                    <input
                                        id='state'
                                        type='text'
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                        {...formik.getFieldProps('state')}
                                    />
                                    {formik.touched.state &&
                                        formik.errors.state && (
                                            <p className='mt-1 text-sm text-red-600'>
                                                {formik.errors.state}
                                            </p>
                                        )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor='zipCode'
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    ZIP Code
                                </label>
                                <input
                                    id='zipCode'
                                    type='text'
                                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500'
                                    {...formik.getFieldProps('zipCode')}
                                />
                                {formik.touched.zipCode &&
                                    formik.errors.zipCode && (
                                        <p className='mt-1 text-sm text-red-600'>
                                            {formik.errors.zipCode}
                                        </p>
                                    )}
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center justify-between'>
                        <button
                            type='button'
                            onClick={() => router.push('/cart')}
                            className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                        >
                            Back to Cart
                        </button>
                        <button
                            type='submit'
                            disabled={isProcessing}
                            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isProcessing ? (
                                <>
                                    <FaLock className='mr-2' />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FaLock className='mr-2' />
                                    Place Order
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
