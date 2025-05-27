import MenuItemClient from './MenuItemClient';

async function getItem(id: string) {
    const res = await fetch(
        `${
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'
        }/api/items/${id}`,
        { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
}

async function getReviews(id: string) {
    const res = await fetch(
        `${
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'
        }/api/reviews?id=${id}`,
        { cache: 'no-store' }
    );
    if (!res.ok) return [];
    return res.json();
}

export default async function MenuItemPage({
    params,
}: {
    params: { id: string };
}) {
    const item = await getItem(params.id);
    if (!item) {
        return <MenuItemClient item={null} relatedItems={[]} reviews={[]} />;
    }

    // Related items (можно получить по id из item.relatedItems, если есть)
    let relatedItems: any[] = [];
    if (item.relatedItems && item.relatedItems.length > 0) {
        // Получаем связанные блюда по id (можно оптимизировать через API)
        relatedItems = await Promise.all(
            item.relatedItems.map(async (relatedId: number) => {
                const res = await fetch(
                    `${
                        process.env.NEXT_PUBLIC_BASE_URL ||
                        'http://localhost:3002'
                    }/api/items/${relatedId}`,
                    { cache: 'no-store' }
                );
                if (!res.ok) return null;
                return res.json();
            })
        );
        relatedItems = relatedItems.filter(Boolean);
    }

    const reviews = await getReviews(params.id);

    return (
        <MenuItemClient
            item={item}
            relatedItems={relatedItems}
            reviews={reviews}
        />
    );
}
