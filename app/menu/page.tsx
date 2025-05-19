import MenuClient from './MenuClient';

async function getItems() {
    try {
        const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/items`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch items: ${res.statusText}`);
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return []; // Return empty array as fallback
    }
}

export default async function MenuPage() {
    const items = await getItems();
    return <MenuClient items={items} />;
}
