'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaShoppingCart,
    FaTrash,
    FaPlus,
    FaMinus,
    FaArrowRight,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// Mock cart data (in a real application, this would come from a cart state or context)
const initialCartItems = [
    {
        id: 1,
        name: 'Salmon Nigiri',
        price: 7.99,
        image: '/images/salmon-nigiri.jpg',
        quantity: 2,
    },
    {
        id: 5,
        name: 'Dragon Roll',
        price: 16.99,
        image: '/images/dragon-roll.jpg',
        quantity: 1,
    },
    {
        id: 9,
        name: 'Vegetable Roll',
        price: 10.99,
        image: '/images/vegetable-roll.jpg',
        quantity: 1,
    },
];

const CartPage = () => {
    const router = useRouter();
    const [cartItems, setCartItems] = useState(initialCartItems);
    const [promoCode, setPromoCode] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');

    // Calculate subtotal
    const subtotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    // Delivery fee (could be calculated based on distance in a real app)
    const deliveryFee = 3.99;

    // Tax calculation (example rate of 8.5%)
    const taxRate = 0.085;
    const tax = (subtotal - discount) * taxRate;

    // Total calculation
    const total = subtotal - discount + deliveryFee + tax;

    const updateQuantity = (id: number, change: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item.id === id) {
                    const newQuantity = item.quantity + change;
                    // Ensure quantity doesn't go below 1
                    return {
                        ...item,
                        quantity: newQuantity > 0 ? newQuantity : 1,
                    };
                }
                return item;
            })
        );
    };

    const removeItem = (id: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
        toast.success('Item removed from cart');
    };

    const applyPromoCode = () => {
        // Simulating promo code check
        setIsApplyingPromo(true);
        setPromoError('');

        // Simulate API call delay
        setTimeout(() => {
            if (promoCode.toLowerCase() === 'sushi20') {
                // 20% discount
                const discountAmount = subtotal * 0.2;
                setDiscount(discountAmount);
                toast.success('Promo code applied successfully!');
            } else if (promoCode.toLowerCase() === 'welcome10') {
                // $10 off
                setDiscount(10);
                toast.success('Promo code applied successfully!');
            } else {
                setPromoError('Invalid promo code');
                toast.error('Invalid promo code');
            }
            setIsApplyingPromo(false);
        }, 1000);
    };

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        // In a real application, you would save the cart state and redirect to checkout
        router.push('/checkout');
    };

    return (
        <div className='bg-gray-50 min-h-screen py-12'>
            <div className='container mx-auto px-4'>
                <div className='flex justify-between items-center mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Your Cart
                    </h1>
                    <Link
                        href='/menu'
                        className='text-red-600 hover:text-red-700 flex items-center'
                    >
                        <span className='mr-2'>Continue Shopping</span>{' '}
                        <FaArrowRight />
                    </Link>
                </div>

                {cartItems.length === 0 ? (
                    <div className='bg-white p-8 rounded-lg shadow-sm text-center'>
                        <div className='text-6xl text-gray-300 flex justify-center mb-4'>
                            <FaShoppingCart />
                        </div>
                        <h2 className='text-2xl font-bold text-gray-700 mb-4'>
                            Your Cart is Empty
                        </h2>
                        <p className='text-gray-500 mb-6'>
                            Looks like you haven't added any items to your cart
                            yet.
                        </p>
                        <Link
                            href='/menu'
                            className='bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition duration-200'
                        >
                            Browse Our Menu
                        </Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        {/* Cart Items */}
                        <div className='lg:col-span-2'>
                            <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
                                <div className='p-6 border-b border-gray-200'>
                                    <h2 className='text-xl font-bold text-gray-800'>
                                        Cart Items (
                                        {cartItems.reduce(
                                            (acc, item) => acc + item.quantity,
                                            0
                                        )}
                                        )
                                    </h2>
                                </div>

                                <div className='divide-y divide-gray-200'>
                                    {cartItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className='p-6 flex flex-col sm:flex-row sm:items-center'
                                        >
                                            <div className='sm:flex-shrink-0 mb-4 sm:mb-0 sm:mr-4'>
                                                <div className='h-24 w-24 bg-gray-200 rounded-md relative'>
                                                    {/* Replace with actual product image */}
                                                    <div className='absolute inset-0 bg-gray-300 flex items-center justify-center'>
                                                        <span className='text-xs text-gray-500'>
                                                            Product Image
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='flex-grow'>
                                                <Link href={`/menu/${item.id}`}>
                                                    <h3 className='text-lg font-bold text-gray-800 hover:text-red-600 transition-colors duration-200'>
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <div className='mt-1 text-red-600 font-bold'>
                                                    ${item.price.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className='mt-4 sm:mt-0 flex items-center'>
                                                <div className='flex items-center border border-gray-300 rounded-md mr-4'>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                -1
                                                            )
                                                        }
                                                        className='h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 border-r border-gray-300'
                                                    >
                                                        <FaMinus size={12} />
                                                    </button>
                                                    <span className='h-8 w-10 flex items-center justify-center text-gray-700'>
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.id,
                                                                1
                                                            )
                                                        }
                                                        className='h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 border-l border-gray-300'
                                                    >
                                                        <FaPlus size={12} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        removeItem(item.id)
                                                    }
                                                    className='text-gray-400 hover:text-red-600 transition-colors duration-200'
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className='lg:col-span-1'>
                            <div className='bg-white rounded-lg shadow-sm overflow-hidden sticky top-4'>
                                <div className='p-6 border-b border-gray-200'>
                                    <h2 className='text-xl font-bold text-gray-800'>
                                        Order Summary
                                    </h2>
                                </div>

                                <div className='p-6'>
                                    <div className='space-y-4'>
                                        <div className='flex justify-between text-gray-600'>
                                            <span>Subtotal</span>
                                            <span>${subtotal.toFixed(2)}</span>
                                        </div>

                                        {discount > 0 && (
                                            <div className='flex justify-between text-green-600'>
                                                <span>Discount</span>
                                                <span>
                                                    -${discount.toFixed(2)}
                                                </span>
                                            </div>
                                        )}

                                        <div className='flex justify-between text-gray-600'>
                                            <span>Delivery Fee</span>
                                            <span>
                                                ${deliveryFee.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className='flex justify-between text-gray-600'>
                                            <span>Tax</span>
                                            <span>${tax.toFixed(2)}</span>
                                        </div>

                                        <div className='pt-4 border-t border-gray-200 flex justify-between font-bold text-lg'>
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Promo Code */}
                                    <div className='mt-6'>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Promo Code
                                        </label>
                                        <div className='flex'>
                                            <input
                                                type='text'
                                                value={promoCode}
                                                onChange={(e) =>
                                                    setPromoCode(e.target.value)
                                                }
                                                placeholder='Enter promo code'
                                                className='flex-grow px-4 py-2 border border-r-0 border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                            />
                                            <button
                                                onClick={applyPromoCode}
                                                disabled={
                                                    isApplyingPromo ||
                                                    !promoCode
                                                }
                                                className='bg-gray-100 text-gray-700 px-4 py-2 border border-gray-300 rounded-r-md hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                {isApplyingPromo
                                                    ? 'Applying...'
                                                    : 'Apply'}
                                            </button>
                                        </div>
                                        {promoError && (
                                            <p className='mt-1 text-sm text-red-600'>
                                                {promoError}
                                            </p>
                                        )}
                                        <p className='mt-1 text-xs text-gray-500'>
                                            Try "SUSHI20" for 20% off or
                                            "WELCOME10" for $10 off
                                        </p>
                                    </div>

                                    {/* Checkout Button */}
                                    <div className='mt-6'>
                                        <button
                                            onClick={handleCheckout}
                                            className='w-full py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center justify-center'
                                        >
                                            Proceed to Checkout{' '}
                                            <FaArrowRight className='ml-2' />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
