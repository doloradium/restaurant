import { PrismaClient } from '@prisma/client';

// Use Prisma with extended types that will be available after migration
const prisma = new PrismaClient();

async function main() {
    console.log('Starting image seeding...');

    // First get all items
    const items = await prisma.item.findMany();

    if (items.length === 0) {
        console.log('No items found in the database');
        return;
    }

    // Image placeholders from Unsplash
    const placeholderImages = [
        'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=500&auto=format&fit=crop', // Salmon Nigiri
        'https://images.unsplash.com/photo-1617196034183-421b4917c92d?q=80&w=500&auto=format&fit=crop', // Dragon Roll
        'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=500&auto=format&fit=crop', // Vegetable Roll
    ];

    console.log(`Found ${items.length} items, adding images...`);

    // Create image entries using raw SQL since Prisma client may not be fully updated
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const imageUrl = placeholderImages[i % placeholderImages.length];

        // Using prisma.$executeRaw to directly insert images
        try {
            await prisma.$executeRaw`
        INSERT INTO "Image" ("itemId", "imageUrl") 
        VALUES (${item.id}, ${imageUrl})
      `;
            console.log(`Added image for item: ${item.name}`);
        } catch (error) {
            console.error(`Failed to add image for ${item.name}:`, error);
        }
    }

    console.log('Image seeding completed!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
