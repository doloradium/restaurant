'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import Link from 'next/link';
import { useCart } from '@/app/CartProvider';

interface MenuItemProps {
    id: string;
    name: string;
    description: string;
    price: number;
    images?: Array<{ id: number; imageUrl: string }>;
    categoryId?: string;
    categoryName?: string;
}

export default function MenuItem({
    id,
    name,
    description,
    price,
    images,
    categoryId,
    categoryName,
}: MenuItemProps) {
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    // Get the first image URL if available
    const imageUrl =
        images && images.length > 0 ? images[0].imageUrl : undefined;

    const handleAddToCart = () => {
        addToCart({
            id,
            name,
            description,
            price,
            quantity,
            image: imageUrl,
            categoryId,
        });
    };

    return (
        <div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300'>
            <div className='h-48 relative'>
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
                        className='object-cover'
                    />
                ) : (
                    <div className='h-full w-full bg-gray-200 flex items-center justify-center'>
                        <span className='text-sm text-gray-500'>
                            Нет изображения
                        </span>
                    </div>
                )}
                {categoryName && (
                    <div className='absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold'>
                        {categoryName}
                    </div>
                )}
            </div>
            <div className='p-4'>
                <h3 className='text-lg font-bold text-gray-800 mb-1'>{name}</h3>
                <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                    {description}
                </p>
                <div className='flex justify-between items-center'>
                    <span className='font-bold text-red-600'>
                        ${price.toFixed(2)}
                    </span>
                    <div className='flex items-center'>
                        <div className='mr-2 flex items-center border rounded'>
                            <button
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                                className='px-2 py-1 text-gray-600 hover:bg-gray-100'
                            >
                                -
                            </button>
                            <span className='px-2'>{quantity}</span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className='px-2 py-1 text-gray-600 hover:bg-gray-100'
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className='bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors duration-200'
                        >
                            <FaShoppingCart />
                        </button>
                    </div>
                </div>
                <Link
                    href={`/menu/${id}`}
                    className='mt-3 block text-center text-sm text-red-600 hover:text-red-700 transition-colors duration-200'
                >
                    Подробнее
                </Link>
            </div>
        </div>
    );
}
