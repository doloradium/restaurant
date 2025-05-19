import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // 1. Категории
    const categories = await prisma.category.createMany({
        data: [{ name: 'Nigiri' }, { name: 'Rolls' }, { name: 'Vegetarian' }],
    });
    const allCategories = await prisma.category.findMany();

    // 2. Товары
    await prisma.item.createMany({
        data: [
            {
                name: 'Salmon Nigiri',
                description: 'Fresh salmon on a bed of seasoned rice',
                price: 7.99,
                categoryId: allCategories[0].id,
            },
            {
                name: 'Dragon Roll',
                description: 'Eel, crab, and cucumber topped with avocado',
                price: 16.99,
                categoryId: allCategories[1].id,
            },
            {
                name: 'Vegetable Roll',
                description:
                    'Avocado, cucumber, and carrot wrapped in nori and rice',
                price: 10.99,
                categoryId: allCategories[2].id,
            },
        ],
    });
    const allItems = await prisma.item.findMany();

    // 3. Пользователи
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.user.createMany({
        data: [
            {
                name: 'John',
                surname: 'Doe',
                email: 'john@example.com',
                passwordHash,
                role: 'USER',
                rating: 4.5,
            },
            {
                name: 'Anna',
                surname: 'Ivanova',
                email: 'anna@example.com',
                passwordHash,
                role: 'USER',
                rating: 5,
            },
            {
                name: 'Admin',
                surname: 'Root',
                email: 'admin@example.com',
                passwordHash,
                role: 'ADMIN',
                rating: 5,
            },
        ],
    });
    const allUsers = await prisma.user.findMany();

    // 4. Заказы
    await prisma.order.createMany({
        data: [
            {
                userId: allUsers[0].id,
                paymentType: 'card',
                isPaid: true,
                isCompleted: true,
                status: 'DELIVERED',
            },
            {
                userId: allUsers[1].id,
                paymentType: 'cash',
                isPaid: false,
                isCompleted: false,
                status: 'PENDING',
            },
            {
                userId: allUsers[2].id,
                paymentType: 'card',
                isPaid: true,
                isCompleted: false,
                status: 'PREPARING',
            },
        ],
    });
    const allOrders = await prisma.order.findMany();

    // 5. OrderItems (по 2-3 позиции в каждом заказе)
    await prisma.orderItem.createMany({
        data: [
            // Order 1
            { orderId: allOrders[0].id, itemId: allItems[0].id, quantity: 2 },
            { orderId: allOrders[0].id, itemId: allItems[1].id, quantity: 1 },
            // Order 2
            { orderId: allOrders[1].id, itemId: allItems[1].id, quantity: 3 },
            { orderId: allOrders[1].id, itemId: allItems[2].id, quantity: 1 },
            // Order 3
            { orderId: allOrders[2].id, itemId: allItems[0].id, quantity: 1 },
            { orderId: allOrders[2].id, itemId: allItems[2].id, quantity: 2 },
        ],
    });

    // 6. Отзывы
    await prisma.review.createMany({
        data: [
            {
                itemId: allItems[0].id,
                userId: allUsers[0].id,
                text: 'Очень вкусно!',
            },
            {
                itemId: allItems[1].id,
                userId: allUsers[1].id,
                text: 'Ролл отличный, свежий.',
            },
            {
                itemId: allItems[2].id,
                userId: allUsers[2].id,
                text: 'Вегетарианский ролл понравился.',
            },
        ],
    });
}

main()
    .then(() => {
        console.log('Seeding finished.');
        return prisma.$disconnect();
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
