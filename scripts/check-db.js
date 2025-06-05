const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('=== Database Population Check ===');

        // Check ADMIN user
        const adminCount = await prisma.user.count({
            where: { role: 'ADMIN' },
        });
        console.log(`Admin users: ${adminCount}`);

        // Check USER count and their addresses
        const users = await prisma.user.findMany({
            where: { role: 'USER' },
            include: { addresses: true },
        });
        console.log(`Regular users: ${users.length}`);

        // Check addresses per user
        let usersWithTwoAddresses = 0;
        for (const user of users) {
            if (user.addresses.length === 2) {
                usersWithTwoAddresses++;
            }
            console.log(
                `User ${user.name} has ${user.addresses.length} addresses`
            );
        }
        console.log(
            `Users with exactly 2 addresses: ${usersWithTwoAddresses}/${users.length}`
        );

        // Check categories and their dishes
        const categories = await prisma.category.findMany({
            include: { items: true },
        });
        console.log(`\nCategories: ${categories.length}`);

        let categoriesWithThreeDishes = 0;
        for (const category of categories) {
            if (category.items.length >= 3) {
                categoriesWithThreeDishes++;
            }
            console.log(
                `Category ${category.name} has ${category.items.length} dishes`
            );
        }
        console.log(
            `Categories with 3+ dishes: ${categoriesWithThreeDishes}/${categories.length}`
        );

        // Check dishes and their reviews
        const dishes = await prisma.item.findMany({
            include: { reviews: true },
        });
        console.log(`\nTotal dishes: ${dishes.length}`);

        let dishesWithThreeReviews = 0;
        for (const dish of dishes) {
            if (dish.reviews.length >= 3) {
                dishesWithThreeReviews++;
            }
        }
        console.log(
            `Dishes with 3+ reviews: ${dishesWithThreeReviews}/${dishes.length}`
        );

        // Get total reviews
        const reviewCount = await prisma.review.count();
        console.log(`Total reviews: ${reviewCount}`);

        console.log('\n=== Check Complete ===');
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
