import HomeClient from './HomeClient';

async function getCategories() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`,
            {
                cache: 'no-store',
            }
        );
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

async function getReviews() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/reviews`,
            {
                cache: 'no-store',
            }
        );
        if (!res.ok) throw new Error('Failed to fetch reviews');
        return res.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

async function getPopularDishes() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/items`,
            {
                cache: 'no-store',
            }
        );
        if (!res.ok) throw new Error('Failed to fetch popular dishes');
        return res.json();
    } catch (error) {
        console.error('Error fetching popular dishes:', error);
        return [];
    }
}

export default async function HomePage() {
    const [categories, reviews, popularDishes] = await Promise.all([
        getCategories(),
        getReviews(),
        getPopularDishes(),
    ]);

    return (
        <HomeClient
            categories={categories}
            reviews={reviews}
            popularDishes={popularDishes}
        />
    );
}
