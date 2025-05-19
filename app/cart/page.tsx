'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface CartItem {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    image: string;
}

const CartPage = () => {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    const updateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            const response = await fetch(`/api/cart/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (response.ok) {
                const updatedCart = await response.json();
                setCart(updatedCart);
                toast.success('Cart updated');
            } else {
                toast.error('Failed to update cart');
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            const response = await fetch(`/api/cart/${itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                const updatedCart = await response.json();
                setCart(updatedCart);
                toast.success('Item removed from cart');
            } else {
                toast.error('Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        }
    };

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
                        Add some delicious items to your cart to get started!
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
                    Your Cart
                </h2>

                <div className='bg-white shadow rounded-lg divide-y divide-gray-200'>
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className='p-6 flex items-center space-x-4'
                        >
                            <div className='flex-shrink-0 w-24 h-24 relative'>
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className='rounded-lg object-cover'
                                />
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
                                onClick={() => removeItem(item.id)}
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
                            Total
                        </h3>
                        <p className='text-2xl font-bold text-red-600'>
                            ${calculateTotal().toFixed(2)}
                        </p>
                    </div>

                    <button
                        onClick={() => router.push('/checkout')}
                        className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
