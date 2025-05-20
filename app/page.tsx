import HomeClient from './HomeClient';
import { prisma } from '@/lib/prisma';

export default async function Home() {
    // Fetch categories from API
    const categoriesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/categories`,
        {
            cache: 'no-store',
        }
    );
    const categories = await categoriesResponse.json();

    // Mock data for reviews (in a real app, you'd fetch these from an API as well)
    const reviews = [
        {
            id: 1,
            name: 'Анна П.',
            rating: 5,
            text: 'Лучшие суши, которые я когда-либо пробовала! Свежие ингредиенты и прекрасное обслуживание.',
        },
        {
            id: 2,
            name: 'Михаил К.',
            rating: 4,
            text: 'Отличный выбор и вкусная еда. Немного дороговато, но качество того стоит.',
        },
        {
            id: 3,
            name: 'Елена С.',
            rating: 5,
            text: 'Доставка всегда вовремя, еда свежая и вкусная. Рекомендую всем!',
        },
    ];

    // Fetch popular dishes from API
    const itemsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/items?limit=4`,
        {
            cache: 'no-store',
        }
    );
    const popularDishes = await itemsResponse.json();

    return (
        <HomeClient
            categories={categories}
            reviews={reviews}
            popularDishes={popularDishes}
        />
    );
}
