'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MenuClient from './MenuClient';

export default function MenuPage() {
    const searchParams = useSearchParams();
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const category = searchParams.get('category') || '';

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

                const [categoriesRes, itemsRes] = await Promise.all([
                    fetch(`${baseUrl}/api/categories`, { cache: 'no-store' }),
                    fetch(`${baseUrl}/api/items?limit=1000`, {
                        cache: 'no-store',
                    }),
                ]);

                if (!categoriesRes.ok) {
                    throw new Error('Failed to fetch categories');
                }

                if (!itemsRes.ok) {
                    throw new Error('Failed to fetch items');
                }

                const [categoriesData, itemsData] = await Promise.all([
                    categoriesRes.json(),
                    itemsRes.json(),
                ]);

                setCategories(categoriesData);
                setItems(itemsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600'></div>
            </div>
        );
    }

    return (
        <MenuClient
            items={items}
            categories={categories}
            selectedCategory={category}
        />
    );
}
