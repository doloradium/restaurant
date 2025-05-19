import HomeClient from './HomeClient';

async function getCategories() {
    const res = await fetch(
        `${
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        }/api/categories`,
        { cache: 'no-store' }
    );
    return res.json();
}

async function getReviews() {
    const res = await fetch(
        `${
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        }/api/reviews`,
        { cache: 'no-store' }
    );
    return res.json();
}

async function getPopularDishes() {
    const res = await fetch(
        `${
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        }/api/items?limit=4&offset=0`,
        { cache: 'no-store' }
    );
    return res.json();
}

export default async function CustomerPage() {
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
