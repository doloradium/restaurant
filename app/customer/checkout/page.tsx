'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaArrowLeft,
    FaCreditCard,
    FaMoneyBillWave,
    FaShoppingBag,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Mock cart summary data (in a real app, this would come from a cart state or context)
const cartSummary = {
    items: [
        { id: 1, name: 'Salmon Nigiri', quantity: 2, price: 7.99 },
        { id: 5, name: 'Dragon Roll', quantity: 1, price: 16.99 },
        { id: 9, name: 'Vegetable Roll', quantity: 1, price: 10.99 },
    ],
    subtotal: 43.96,
    discount: 0,
    deliveryFee: 3.99,
    tax: 3.74,
    total: 51.69,
};

const CheckoutPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: 'credit',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: '',
        saveInfo: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });

        // Clear error when field is changed
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            paymentMethod: e.target.value,
        });
    };

    const validate = () => {
        let newErrors: Record<string, string> = {};

        // Basic validations
        if (!formData.firstName.trim())
            newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim())
            newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phone.trim())
            newErrors.phone = 'Phone number is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.postalCode.trim())
            newErrors.postalCode = 'Postal code is required';

        // Credit card validations
        if (formData.paymentMethod === 'credit') {
            if (!formData.cardNumber.trim())
                newErrors.cardNumber = 'Card number is required';
            if (!formData.cardName.trim())
                newErrors.cardName = 'Name on card is required';
            if (!formData.expiryDate.trim())
                newErrors.expiryDate = 'Expiry date is required';
            if (!formData.cvv.trim()) newErrors.cvv = 'CVV is required';
        }

        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        // Simulate API call delay
        setTimeout(() => {
            // In a real application, you would submit the form data to a server
            toast.success('Order placed successfully!');
            router.push('/customer/confirmation');
            setIsSubmitting(false);
        }, 1500);
    };

    return (
        <div className='bg-gray-50 min-h-screen py-12'>
            <div className='container mx-auto px-4'>
                <div className='mb-8'>
                    <Link
                        href='/customer/cart'
                        className='text-gray-600 hover:text-red-600 flex items-center'
                    >
                        <FaArrowLeft className='mr-2' /> Back to Cart
                    </Link>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Checkout Form */}
                    <div className='lg:col-span-2'>
                        <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                            <div className='p-6 border-b border-gray-200'>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    Checkout
                                </h1>
                            </div>

                            <form onSubmit={handleSubmit} className='p-6'>
                                {/* Contact Information */}
                                <div className='mb-8'>
                                    <h2 className='text-lg font-bold text-gray-800 mb-4'>
                                        Contact Information
                                    </h2>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        <div>
                                            <label
                                                htmlFor='firstName'
                                                className='block text-sm font-medium text-gray-700 mb-1'
                                            >
                                                First Name *
                                            </label>
                                            <input
                                                type='text'
                                                id='firstName'
                                                name='firstName'
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${
                                                    errors.firstName
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                            />
                                            {errors.firstName && (
                                                <p className='mt-1 text-sm text-red-600'>
                                                    {errors.firstName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor='lastName'
                                                className='block text-sm font-medium text-gray-700 mb-1'
                                            >
                                                Last Name *
                                            </label>
                                            <input
                                                type='text'
                                                id='lastName'
                                                name='lastName'
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${
                                                    errors.lastName
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                            />
                                            {errors.lastName && (
                                                <p className='mt-1 text-sm text-red-600'>
                                                    {errors.lastName}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor='email'
                                                className='block text-sm font-medium text-gray-700 mb-1'
                                            >
                                                Email *
                                            </label>
                                            <input
                                                type='email'
                                                id='email'
                                                name='email'
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${
                                                    errors.email
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                            />
                                            {errors.email && (
                                                <p className='mt-1 text-sm text-red-600'>
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label
                                                htmlFor='phone'
                                                className='block text-sm font-medium text-gray-700 mb-1'
                                            >
                                                Phone Number *
                                            </label>
                                            <input
                                                type='tel'
                                                id='phone'
                                                name='phone'
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${
                                                    errors.phone
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                            />
                                            {errors.phone && (
                                                <p className='mt-1 text-sm text-red-600'>
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className='mb-8'>
                                    <h2 className='text-lg font-bold text-gray-800 mb-4'>
                                        Delivery Address
                                    </h2>
                                    <div className='grid grid-cols-1 gap-4'>
                                        <div>
                                            <label
                                                htmlFor='address'
                                                className='block text-sm font-medium text-gray-700 mb-1'
                                            >
                                                Street Address *
                                            </label>
                                            <input
                                                type='text'
                                                id='address'
                                                name='address'
                                                value={formData.address}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-2 border ${
                                                    errors.address
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                            />
                                            {errors.address && (
                                                <p className='mt-1 text-sm text-red-600'>
                                                    {errors.address}
                                                </p>
                                            )}
                                        </div>
                                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                            <div>
                                                <label
                                                    htmlFor='city'
                                                    className='block text-sm font-medium text-gray-700 mb-1'
                                                >
                                                    City *
                                                </label>
                                                <input
                                                    type='text'
                                                    id='city'
                                                    name='city'
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${
                                                        errors.city
                                                            ? 'border-red-500'
                                                            : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                                />
                                                {errors.city && (
                                                    <p className='mt-1 text-sm text-red-600'>
                                                        {errors.city}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor='postalCode'
                                                    className='block text-sm font-medium text-gray-700 mb-1'
                                                >
                                                    Postal Code *
                                                </label>
                                                <input
                                                    type='text'
                                                    id='postalCode'
                                                    name='postalCode'
                                                    value={formData.postalCode}
                                                    onChange={handleChange}
                                                    className={`w-full px-4 py-2 border ${
                                                        errors.postalCode
                                                            ? 'border-red-500'
                                                            : 'border-gray-300'
                                                    } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                                />
                                                {errors.postalCode && (
                                                    <p className='mt-1 text-sm text-red-600'>
                                                        {errors.postalCode}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className='mb-8'>
                                    <h2 className='text-lg font-bold text-gray-800 mb-4'>
                                        Payment Method
                                    </h2>
                                    <div className='space-y-4'>
                                        <div className='flex items-center'>
                                            <input
                                                id='creditCard'
                                                name='paymentMethod'
                                                type='radio'
                                                value='credit'
                                                checked={
                                                    formData.paymentMethod ===
                                                    'credit'
                                                }
                                                onChange={handleRadioChange}
                                                className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300'
                                            />
                                            <label
                                                htmlFor='creditCard'
                                                className='ml-3 flex items-center text-gray-700'
                                            >
                                                <FaCreditCard className='mr-2 text-gray-500' />
                                                Credit / Debit Card
                                            </label>
                                        </div>
                                        <div className='flex items-center'>
                                            <input
                                                id='cash'
                                                name='paymentMethod'
                                                type='radio'
                                                value='cash'
                                                checked={
                                                    formData.paymentMethod ===
                                                    'cash'
                                                }
                                                onChange={handleRadioChange}
                                                className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300'
                                            />
                                            <label
                                                htmlFor='cash'
                                                className='ml-3 flex items-center text-gray-700'
                                            >
                                                <FaMoneyBillWave className='mr-2 text-gray-500' />
                                                Cash on Delivery
                                            </label>
                                        </div>

                                        {formData.paymentMethod ===
                                            'credit' && (
                                            <div className='mt-4 p-4 border border-gray-200 rounded-md bg-gray-50'>
                                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                                    <div className='md:col-span-2'>
                                                        <label
                                                            htmlFor='cardNumber'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Card Number *
                                                        </label>
                                                        <input
                                                            type='text'
                                                            id='cardNumber'
                                                            name='cardNumber'
                                                            value={
                                                                formData.cardNumber
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder='1234 5678 9012 3456'
                                                            className={`w-full px-4 py-2 border ${
                                                                errors.cardNumber
                                                                    ? 'border-red-500'
                                                                    : 'border-gray-300'
                                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                                        />
                                                        {errors.cardNumber && (
                                                            <p className='mt-1 text-sm text-red-600'>
                                                                {
                                                                    errors.cardNumber
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className='md:col-span-2'>
                                                        <label
                                                            htmlFor='cardName'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Name on Card *
                                                        </label>
                                                        <input
                                                            type='text'
                                                            id='cardName'
                                                            name='cardName'
                                                            value={
                                                                formData.cardName
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className={`w-full px-4 py-2 border ${
                                                                errors.cardName
                                                                    ? 'border-red-500'
                                                                    : 'border-gray-300'
                                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                                        />
                                                        {errors.cardName && (
                                                            <p className='mt-1 text-sm text-red-600'>
                                                                {
                                                                    errors.cardName
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor='expiryDate'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            Expiry Date *
                                                        </label>
                                                        <input
                                                            type='text'
                                                            id='expiryDate'
                                                            name='expiryDate'
                                                            value={
                                                                formData.expiryDate
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder='MM/YY'
                                                            className={`w-full px-4 py-2 border ${
                                                                errors.expiryDate
                                                                    ? 'border-red-500'
                                                                    : 'border-gray-300'
                                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                                        />
                                                        {errors.expiryDate && (
                                                            <p className='mt-1 text-sm text-red-600'>
                                                                {
                                                                    errors.expiryDate
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label
                                                            htmlFor='cvv'
                                                            className='block text-sm font-medium text-gray-700 mb-1'
                                                        >
                                                            CVV *
                                                        </label>
                                                        <input
                                                            type='text'
                                                            id='cvv'
                                                            name='cvv'
                                                            value={formData.cvv}
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder='123'
                                                            className={`w-full px-4 py-2 border ${
                                                                errors.cvv
                                                                    ? 'border-red-500'
                                                                    : 'border-gray-300'
                                                            } rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                                                        />
                                                        {errors.cvv && (
                                                            <p className='mt-1 text-sm text-red-600'>
                                                                {errors.cvv}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Save Information */}
                                <div className='mb-8'>
                                    <div className='flex items-center'>
                                        <input
                                            id='saveInfo'
                                            name='saveInfo'
                                            type='checkbox'
                                            checked={formData.saveInfo}
                                            onChange={handleChange}
                                            className='h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded'
                                        />
                                        <label
                                            htmlFor='saveInfo'
                                            className='ml-2 block text-sm text-gray-700'
                                        >
                                            Save this information for faster
                                            checkout next time
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div>
                                    <button
                                        type='submit'
                                        disabled={isSubmitting}
                                        className='w-full py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors duration-200 disabled:bg-red-300 disabled:cursor-not-allowed'
                                    >
                                        {isSubmitting
                                            ? 'Processing...'
                                            : 'Place Order'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className='lg:col-span-1'>
                        <div className='bg-white rounded-lg shadow-sm overflow-hidden sticky top-4'>
                            <div className='p-6 border-b border-gray-200'>
                                <h2 className='text-lg font-bold text-gray-800 flex items-center'>
                                    <FaShoppingBag className='mr-2 text-gray-500' />
                                    Order Summary
                                </h2>
                            </div>

                            <div className='p-6'>
                                <div className='mb-6'>
                                    <h3 className='text-sm font-medium text-gray-700 mb-3'>
                                        ITEMS (
                                        {cartSummary.items.reduce(
                                            (total, item) =>
                                                total + item.quantity,
                                            0
                                        )}
                                        )
                                    </h3>
                                    <div className='space-y-3'>
                                        {cartSummary.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className='flex justify-between text-sm'
                                            >
                                                <span className='text-gray-600'>
                                                    {item.quantity} x{' '}
                                                    {item.name}
                                                </span>
                                                <span className='font-medium text-gray-800'>
                                                    $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='space-y-3 border-t border-gray-200 pt-4'>
                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-600'>
                                            Subtotal
                                        </span>
                                        <span className='font-medium text-gray-800'>
                                            ${cartSummary.subtotal.toFixed(2)}
                                        </span>
                                    </div>

                                    {cartSummary.discount > 0 && (
                                        <div className='flex justify-between text-sm'>
                                            <span className='text-green-600'>
                                                Discount
                                            </span>
                                            <span className='font-medium text-green-600'>
                                                -$
                                                {cartSummary.discount.toFixed(
                                                    2
                                                )}
                                            </span>
                                        </div>
                                    )}

                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-600'>
                                            Delivery Fee
                                        </span>
                                        <span className='font-medium text-gray-800'>
                                            $
                                            {cartSummary.deliveryFee.toFixed(2)}
                                        </span>
                                    </div>

                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-600'>
                                            Tax
                                        </span>
                                        <span className='font-medium text-gray-800'>
                                            ${cartSummary.tax.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className='border-t border-gray-200 mt-4 pt-4'>
                                    <div className='flex justify-between items-center'>
                                        <span className='text-base font-bold text-gray-900'>
                                            Total
                                        </span>
                                        <span className='text-xl font-bold text-red-600'>
                                            ${cartSummary.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
