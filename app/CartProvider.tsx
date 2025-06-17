'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    image?: string;
    categoryId?: string;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default function CartProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from localStorage on initial load
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse saved cart', error);
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item: CartItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(
                (cartItem) => cartItem.id === item.id
            );

            if (existingItem) {
                const updatedCart = prevCart.map((cartItem) =>
                    cartItem.id === item.id
                        ? {
                              ...cartItem,
                              quantity: cartItem.quantity + item.quantity,
                          }
                        : cartItem
                );
                return updatedCart;
            } else {
                return [...prevCart, item];
            }
        });

        const isExisting = cart.some((cartItem) => cartItem.id === item.id);
        if (isExisting) {
            toast.success('Количество обновлено');
        } else {
            toast.success('Добавлено в корзину');
        }
    };

    const removeFromCart = (itemId: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
        toast.success('Удалено из корзины');
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) return;

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
        toast.success('Корзина очищена');
    };

    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
}

// Helper function to construct image URL
const getImageUrl = (item: any) => {
    // If item already has a complete image URL
    if (
        item.imageUrl &&
        (item.imageUrl.startsWith('/') || item.imageUrl.startsWith('http'))
    ) {
        return item.imageUrl;
    }

    // If item.item has an imageUrl (from order history)
    if (
        item.item?.imageUrl &&
        (item.item.imageUrl.startsWith('/') ||
            item.item.imageUrl.startsWith('http'))
    ) {
        return item.item.imageUrl;
    }

    // If there's an image ID and it seems to be a full path already
    if (
        item.image &&
        (item.image.startsWith('/') || item.image.includes('/'))
    ) {
        return item.image;
    }

    // If item.item has an image that's a full path
    if (
        item.item?.image &&
        (item.item.image.startsWith('/') || item.item.image.includes('/'))
    ) {
        return item.item.image;
    }

    // If item has an ID, use that to fetch image from the new API route
    if (item.id) {
        return `/api/images/${item.id}`;
    }

    // If item.item has an ID, use that to fetch image
    if (item.item?.id) {
        return `/api/images/${item.item.id}`;
    }

    // Check if image is an uploaded file ID (numeric or has specific format)
    if (item.image) {
        // If the image might be an uploaded file, use API route
        return `/api/images/${item.image}`;
    }

    // If item.item has an image ID
    if (item.item?.image) {
        return `/api/images/${item.item.image}`;
    }

    // Default image if none available
    return '/images/default-dish.jpg';
};
