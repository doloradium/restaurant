const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Russian names for users
const userNames = [
    // Admin - existing user with ID 1
    {
        role: 'ADMIN',
        name: 'Админ',
        surname: 'Администратов',
        email: 'admin@smith.com',
    },
    // Cook
    {
        role: 'COOK',
        name: 'Иван',
        surname: 'Поваренко',
        email: 'cook@smith.com',
    },
    // Courier
    {
        role: 'COURIER',
        name: 'Дмитрий',
        surname: 'Курьеров',
        email: 'courier@smith.com',
    },
    // User 1
    {
        role: 'USER',
        name: 'Алексей',
        surname: 'Иванов',
        email: 'user1@example.com',
    },
    // User 2
    {
        role: 'USER',
        name: 'Мария',
        surname: 'Петрова',
        email: 'user2@example.com',
    },
    // User 3
    {
        role: 'USER',
        name: 'Екатерина',
        surname: 'Смирнова',
        email: 'user3@example.com',
    },
];

// Sample Russian addresses
const sampleAddresses = [
    {
        city: 'Москва',
        street: 'Тверская',
        houseNumber: '15',
        apartment: '45',
        entrance: '2',
        floor: '5',
        intercom: '4578',
    },
    {
        city: 'Санкт-Петербург',
        street: 'Невский проспект',
        houseNumber: '78',
        apartment: '102',
        entrance: '1',
        floor: '7',
        intercom: '7890',
    },
    {
        city: 'Москва',
        street: 'Ленинградский проспект',
        houseNumber: '33',
        apartment: '17',
        entrance: '4',
        floor: '3',
        intercom: '1723',
    },
    {
        city: 'Москва',
        street: 'Арбат',
        houseNumber: '10',
        apartment: '8',
        entrance: '1',
        floor: '2',
        intercom: '0897',
    },
    {
        city: 'Санкт-Петербург',
        street: 'Гороховая',
        houseNumber: '25',
        apartment: '65',
        entrance: '3',
        floor: '6',
        intercom: '6543',
    },
];

// Categories in Russian
const categories = [
    { name: 'Супы' },
    { name: 'Салаты' },
    { name: 'Горячие блюда' },
    { name: 'Десерты' },
    { name: 'Напитки' },
    { name: 'Закуски' },
    { name: 'Пицца' },
    { name: 'Суши и роллы' },
    { name: 'Гарниры' },
];

// Function to generate a random price between 200 and 1000
const randomPrice = () => Math.floor(Math.random() * 800) + 200;

// Dishes in Russian with categories
const dishes = [
    // Category 1: Супы (Soups)
    {
        name: 'Борщ',
        description:
            'Классический украинский борщ со свининой, свеклой и капустой. Подается с долькой сметаны и свежей зеленью. Насыщенный вкус и аромат этого блюда не оставит равнодушным даже самого требовательного гурмана. Идеален для согревающего обеда.',
        price: randomPrice(),
        categoryId: 1,
    },
    {
        name: 'Куриный суп',
        description:
            'Легкий куриный суп с домашней лапшой и овощами. Приготовлен на наваристом бульоне из фермерской курицы. Содержит морковь, лук, сельдерей и свежую зелень. Блюдо обладает нежным вкусом и согревающим эффектом.',
        price: randomPrice(),
        categoryId: 1,
    },
    {
        name: 'Грибной крем-суп',
        description:
            'Нежный крем-суп из белых грибов со сливками и трюфельным маслом. Блюдо сочетает в себе изысканный аромат лесных грибов и нежную сливочную текстуру. Подается с гренками из бородинского хлеба. Настоящий деликатес для ценителей грибных блюд.',
        price: randomPrice(),
        categoryId: 1,
    },

    // Category 2: Салаты (Salads)
    {
        name: 'Цезарь с курицей',
        description:
            'Классический салат Цезарь с сочной куриной грудкой, хрустящими гренками, листьями романо и фирменным соусом. Блюдо украшено стружкой пармезана и помидорами черри. Идеальное сочетание свежести и насыщенного вкуса. Подается в глубокой тарелке с отдельным соусником.',
        price: randomPrice(),
        categoryId: 2,
    },
    {
        name: 'Греческий салат',
        description:
            'Традиционный греческий салат с крупными кусочками свежих овощей, оливками и сыром фета. Заправлен оливковым маслом и бальзамическим уксусом. Содержит огурцы, помидоры, болгарский перец и красный лук. Освежающее блюдо, идеальное для легкого ужина.',
        price: randomPrice(),
        categoryId: 2,
    },
    {
        name: 'Оливье',
        description:
            'Традиционный русский салат Оливье с нежной ветчиной, свежими овощами и отварным картофелем. Приготовлен на основе домашнего майонеза. В составе также присутствуют зеленый горошек, морковь и маринованные огурцы. Украшен перепелиными яйцами и зеленью.',
        price: randomPrice(),
        categoryId: 2,
    },

    // Category 3: Горячие блюда (Main dishes)
    {
        name: 'Котлета по-киевски',
        description:
            'Сочная котлета из куриного филе с начинкой из сливочного масла и трав. Панирована в хрустящих сухарях и обжарена до золотистой корочки. При разрезании выделяется ароматное масло с зеленью. Подается с картофельным пюре и свежими овощами.',
        price: randomPrice(),
        categoryId: 3,
    },
    {
        name: 'Говядина по-строгановски',
        description:
            'Нежные кусочки говяжьей вырезки, тушенные в сметанном соусе с грибами и луком. Блюдо обладает богатым вкусом и изысканным ароматом. Приготовлено по старинному русскому рецепту. Подается с отварным картофелем или гречневой кашей.',
        price: randomPrice(),
        categoryId: 3,
    },
    {
        name: 'Рыба с овощами',
        description:
            'Филе судака, запеченное с сезонными овощами под сырной корочкой. Нежная рыба сохраняет свой сок и аромат благодаря специальному способу приготовления. Овощной гарнир включает цукини, болгарский перец и помидоры черри. Блюдо украшено свежей зеленью и лимоном.',
        price: randomPrice(),
        categoryId: 3,
    },

    // Additional dishes for other categories...
];

// Review texts
const reviewTexts = [
    'Отличное блюдо! Вкус превзошел все мои ожидания. Буду заказывать снова и рекомендовать друзьям.',
    'Очень вкусно, но порция могла бы быть больше. В целом остался доволен.',
    'Идеальное сочетание ингредиентов. Свежо и оригинально.',
    'Хорошее блюдо, но немного пересоленное на мой вкус.',
    'Превосходно! Давно не пробовал ничего вкуснее.',
    'Достойное блюдо, но цена немного завышена.',
    'Очень оригинальная подача и потрясающий вкус.',
    'Свежие ингредиенты и отличное приготовление.',
    'Неплохо, но я ожидал большего за эту цену.',
    'Восхитительно! Каждый кусочек - настоящее наслаждение.',
];

// Function to generate a random rating between 3 and 5
const randomRating = () => Math.floor(Math.random() * 3) + 3;

// Function to get a random review text
const getRandomReviewText = () =>
    reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

// Function to get a random address from the sample addresses
const getRandomAddress = () =>
    sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

async function main() {
    try {
        console.log('Starting database population...');

        // Create users (except admin with ID 1 who already exists)
        for (let i = 1; i < userNames.length; i++) {
            const userExists = await prisma.user.findFirst({
                where: { email: userNames[i].email },
            });

            if (!userExists) {
                await prisma.user.create({
                    data: {
                        name: userNames[i].name,
                        surname: userNames[i].surname,
                        email: userNames[i].email,
                        role: userNames[i].role,
                        passwordHash:
                            '$2b$10$rtnnuMlfNMst9YL4T.gz1.qkQgRaedaaongGJc53RGKk6qpGdlr0.',
                    },
                });
                console.log(
                    `Created user: ${userNames[i].name} ${userNames[i].surname} (${userNames[i].role})`
                );
            } else {
                console.log(`User ${userNames[i].email} already exists.`);
            }
        }

        // Create addresses for users
        // Get all users with role USER and ADMIN (we'll add addresses for them too)
        const users = await prisma.user.findMany({
            where: {
                OR: [{ role: 'USER' }, { role: 'ADMIN' }],
            },
        });

        // Add 1-2 addresses for each user
        for (const user of users) {
            // Check if user already has addresses
            const userAddresses = await prisma.address.findMany({
                where: { userId: user.id },
            });

            if (userAddresses.length === 0) {
                // Add primary address
                const primaryAddress = getRandomAddress();
                await prisma.address.create({
                    data: {
                        userId: user.id,
                        ...primaryAddress,
                    },
                });
                console.log(`Created primary address for user ${user.name}`);

                // 50% chance to add a second address
                if (Math.random() > 0.5) {
                    // Get a different address
                    let secondaryAddress = getRandomAddress();
                    while (
                        secondaryAddress.street === primaryAddress.street &&
                        secondaryAddress.houseNumber ===
                            primaryAddress.houseNumber
                    ) {
                        secondaryAddress = getRandomAddress();
                    }

                    await prisma.address.create({
                        data: {
                            userId: user.id,
                            ...secondaryAddress,
                        },
                    });
                    console.log(
                        `Created secondary address for user ${user.name}`
                    );
                }
            } else {
                console.log(
                    `User ${user.name} already has ${userAddresses.length} addresses.`
                );
            }
        }

        // Create categories
        for (const category of categories) {
            const categoryExists = await prisma.category.findFirst({
                where: { name: category.name },
            });

            if (!categoryExists) {
                await prisma.category.create({
                    data: category,
                });
                console.log(`Created category: ${category.name}`);
            } else {
                console.log(`Category ${category.name} already exists.`);
            }
        }

        // Create dishes
        for (const dish of dishes) {
            const dishExists = await prisma.item.findFirst({
                where: { name: dish.name },
            });

            if (!dishExists) {
                await prisma.item.create({
                    data: dish,
                });
                console.log(`Created dish: ${dish.name}`);
            } else {
                console.log(`Dish ${dish.name} already exists.`);
            }
        }

        // Skip review creation since we've already completed populating addresses
        console.log('Skipping review creation to focus on address population.');
        console.log('Database population with addresses completed!');
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
