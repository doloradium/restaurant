'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Review {
    id: number;
    text: string;
    createdAt: Date;
}

interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    reviews: Review[];
}

interface Category {
    id: number;
    name: string;
    items: Item[];
}

interface MenuClientProps {
    categories: Category[];
}

export default function MenuClient({ categories }: MenuClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        categories[0]?.name || null
    );

    return (
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
            {/* Categories sidebar */}
            <div className='md:col-span-1'>
                <h2 className='mb-4 text-2xl font-semibold text-gray-900'>
                    Categories
                </h2>
                <div className='space-y-2'>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.name)}
                            className={`w-full rounded-lg px-4 py-2 text-left transition-colors ${
                                selectedCategory === category.name
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Items grid */}
            <div className='md:col-span-3'>
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
                    {categories
                        .find((cat) => cat.name === selectedCategory)
                        ?.items.map((item) => (
                            <div
                                key={item.id}
                                className='overflow-hidden rounded-lg bg-white shadow-md'
                            >
                                <div className='relative h-48 w-full'>
                                    <Image
                                        src={`/images/items/${item.id}.jpg`}
                                        alt={item.name}
                                        fill
                                        className='object-cover'
                                    />
                                </div>
                                <div className='p-4'>
                                    <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                                        {item.name}
                                    </h3>
                                    <p className='mb-4 text-sm text-gray-600'>
                                        {item.description}
                                    </p>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-lg font-bold text-gray-900'>
                                            ${item.price.toFixed(2)}
                                        </span>
                                        <div className='flex items-center'>
                                            <span className='text-sm text-gray-600'>
                                                {item.reviews.length} reviews
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
