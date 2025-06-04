import HomeClient from './HomeClient';

export default async function Home() {
    const categoriesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/categories`,
        {
            cache: 'no-store',
        }
    );
    const categories = await categoriesResponse.json();

    const reviewsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/reviews?limit=12`,
        {
            cache: 'no-store',
        }
    );
    const reviews = await reviewsResponse.json();

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
