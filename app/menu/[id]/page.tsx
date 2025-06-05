import MenuItemClient from './MenuItemClient';

async function getItem(id: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/items/${id}`,
            { cache: 'no-store' }
        );
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error('Error fetching item:', error);
        return null;
    }
}

async function getReviews(id: string) {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/reviews?id=${id}`,
            { cache: 'no-store' }
        );
        if (!res.ok) return [];
        return res.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
}

export default async function MenuItemPage({
    params,
}: {
    params: { id: string };
}) {
    // Make sure we have a valid ID
    const id = params.id;
    if (!id) {
        return <MenuItemClient item={null} relatedItems={[]} reviews={[]} />;
    }

    // Fetch the item data
    const item = await getItem(id);
    if (!item) {
        return <MenuItemClient item={null} relatedItems={[]} reviews={[]} />;
    }

    // Related items
    let relatedItems: any[] = [];
    if (item.relatedItems && item.relatedItems.length > 0) {
        // Get related dishes by ID
        try {
            const relatedPromises = item.relatedItems.map(
                async (relatedId: number) => {
                    try {
                        const res = await fetch(
                            `${
                                process.env.NEXT_PUBLIC_BASE_URL || ''
                            }/api/items/${relatedId}`,
                            { cache: 'no-store' }
                        );
                        if (!res.ok) return null;
                        return res.json();
                    } catch (error) {
                        console.error(
                            `Error fetching related item ${relatedId}:`,
                            error
                        );
                        return null;
                    }
                }
            );

            relatedItems = (await Promise.all(relatedPromises)).filter(Boolean);
        } catch (error) {
            console.error('Error processing related items:', error);
            relatedItems = [];
        }
    }

    // Fetch reviews for this item
    const reviews = await getReviews(id);

    return (
        <MenuItemClient
            item={item}
            relatedItems={relatedItems}
            reviews={reviews}
        />
    );
}
