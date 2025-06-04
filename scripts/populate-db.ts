import { PrismaClient } from '@prisma/client';

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

    // Category 4: Десерты (Desserts)
    {
        name: 'Медовик',
        description:
            'Классический русский торт из медовых коржей с нежным сметанным кремом. Каждый слой пропитан медовым сиропом для дополнительной сочности. Торт украшен крошкой из коржей и свежими ягодами. Отличается мягким медовым вкусом с легкими нотками сметаны.',
        price: randomPrice(),
        categoryId: 4,
    },
    {
        name: 'Шоколадный мусс',
        description:
            'Нежный шоколадный мусс с вишневым соусом и свежими ягодами. Приготовлен из бельгийского шоколада высшего качества. Десерт обладает воздушной консистенцией и насыщенным вкусом какао. Подается в изящном стеклянном бокале с мятным листом.',
        price: randomPrice(),
        categoryId: 4,
    },
    {
        name: 'Чизкейк',
        description:
            'Классический чизкейк на основе печенья с нежным сливочным кремом и ягодным топпингом. Десерт обладает идеальным балансом сладости и кислинки. Текстура блюда - плотная, но тающая во рту. Украшен свежими ягодами малины и мятой.',
        price: randomPrice(),
        categoryId: 4,
    },

    // Category 5: Напитки (Drinks)
    {
        name: 'Морс',
        description:
            'Освежающий ягодный морс, приготовленный из клюквы, черной смородины и брусники. Напиток обладает насыщенным цветом и богатым вкусом лесных ягод. Содержит минимум сахара, сохраняя естественную кислинку ягод. Подается со льдом и веточкой мяты.',
        price: randomPrice(),
        categoryId: 5,
    },
    {
        name: 'Компот',
        description:
            'Домашний компот из сезонных фруктов и ягод по традиционному рецепту. В составе яблоки, груши, вишня и малина. Напиток отличается насыщенным фруктовым вкусом и приятным ароматом. Подается как в холодном, так и в горячем виде.',
        price: randomPrice(),
        categoryId: 5,
    },
    {
        name: 'Лимонад',
        description:
            'Домашний лимонад с мятой, лаймом и свежим имбирем. Приготовлен на основе фильтрованной воды с добавлением натурального сахара. Обладает освежающим цитрусовым вкусом с легкой остротой имбиря. Идеален для утоления жажды в жаркий день.',
        price: randomPrice(),
        categoryId: 5,
    },

    // Category 6: Закуски (Appetizers)
    {
        name: 'Сырные палочки',
        description:
            'Хрустящие палочки из сыра моцарелла в панировке из специй и сухарей. Обжарены до золотистой корочки, сохраняя внутри тягучую консистенцию расплавленного сыра. Подаются с соусом тартар или сладким чили. Идеальная закуска к пиву или вину.',
        price: randomPrice(),
        categoryId: 6,
    },
    {
        name: 'Брускетта',
        description:
            'Классическая итальянская закуска из поджаренного багета с томатами, базиликом и чесноком. Хлеб натерт оливковым маслом и обжарен на гриле. Овощная начинка заправлена бальзамическим кремом. Брускетта украшена листиками свежего базилика и тертым пармезаном.',
        price: randomPrice(),
        categoryId: 6,
    },
    {
        name: 'Крылышки BBQ',
        description:
            'Сочные куриные крылышки, запеченные в фирменном соусе барбекю. Маринованы в специях не менее 6 часов для насыщенного вкуса. Обладают идеальным балансом сладости, остроты и копчености. Подаются с соусом блю-чиз и палочками свежего сельдерея.',
        price: randomPrice(),
        categoryId: 6,
    },

    // Category 7: Пицца (Pizza)
    {
        name: 'Маргарита',
        description:
            'Классическая итальянская пицца с томатным соусом, моцареллой и свежим базиликом. Тесто тонкое, с хрустящими краями, приготовленное по традиционному неаполитанскому рецепту. Запекается в дровяной печи при высокой температуре. Украшена оливковым маслом extra virgin.',
        price: randomPrice(),
        categoryId: 7,
    },
    {
        name: 'Пепперони',
        description:
            'Пицца с томатным соусом, моцареллой и острой салями пепперони. Тесто средней толщины с пышными краями. При запекании пепперони выделяет ароматное масло, которое придает пицце характерный пряный вкус. Украшена свежим орегано и красным перцем чили.',
        price: randomPrice(),
        categoryId: 7,
    },
    {
        name: 'Четыре сыра',
        description:
            'Изысканная пицца на тонком тесте с комбинацией четырех сортов сыра: моцарелла, горгонзола, пармезан и рикотта. Обладает насыщенным сливочным вкусом с характерными нотками каждого сыра. Запекается до образования золотистой корочки. Украшена грецкими орехами и медом.',
        price: randomPrice(),
        categoryId: 7,
    },

    // Category 8: Суши и роллы (Sushi and rolls)
    {
        name: 'Филадельфия',
        description:
            'Классический ролл с нежным лососем, сливочным сыром и авокадо. Обернут тонким листом нори и украшен икрой тобико. Рис для ролла специально подготовлен с добавлением рисового уксуса и секретных специй. Подается с соевым соусом, маринованным имбирем и васаби.',
        price: randomPrice(),
        categoryId: 8,
    },
    {
        name: 'Калифорния',
        description:
            'Популярный ролл в стиле inside-out с крабовым мясом, авокадо и огурцом. Обернут в икру тобико, придающую характерный хруст. Отличается свежим вкусом и яркой презентацией. Каждый кусочек ролла представляет собой идеальное сочетание текстур и вкусов.',
        price: randomPrice(),
        categoryId: 8,
    },
    {
        name: 'Суши-сет',
        description:
            'Ассорти из популярных роллов и суши: Филадельфия, Калифорния, Дракон и нигири с лососем и угрем. Набор содержит 32 кусочка, идеально подходит для компании из 3-4 человек. Каждый элемент сета приготовлен из свежайших ингредиентов. Подается с традиционными соусами и гарнирами.',
        price: randomPrice(),
        categoryId: 8,
    },

    // Category 9: Гарниры (Side dishes)
    {
        name: 'Картофельное пюре',
        description:
            'Нежное картофельное пюре, приготовленное с добавлением сливочного масла и теплого молока. Консистенция блюда - воздушная и однородная. Пюре посыпано свежей зеленью и украшено капелькой топленого масла. Идеальный гарнир к мясным и рыбным блюдам.',
        price: randomPrice(),
        categoryId: 9,
    },
    {
        name: 'Овощи на гриле',
        description:
            'Ассорти из сезонных овощей, обжаренных на гриле: цукини, баклажаны, болгарский перец и помидоры. Овощи маринованы в оливковом масле с травами и чесноком. Блюдо сохраняет естественный вкус каждого овоща, подчеркнутый легким ароматом дыма. Украшено бальзамическим кремом.',
        price: randomPrice(),
        categoryId: 9,
    },
    {
        name: 'Рис с овощами',
        description:
            'Ароматный рис басмати с обжаренными овощами и восточными специями. В состав входят морковь, горошек, кукуруза и болгарский перец. Блюдо приправлено шафраном, карри и свежей зеленью. Обладает ярким вкусом и привлекательным цветом. Подается с долькой лимона.',
        price: randomPrice(),
        categoryId: 9,
    },
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

        // Create reviews (each user reviews each dish)
        // Get all users with role USER (including the existing one)
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { role: 'USER' },
                    { id: 1 }, // Include admin as reviewer too
                ],
            },
        });

        // Get all dishes
        const allDishes = await prisma.item.findMany();

        // Create reviews
        for (const user of users) {
            for (const dish of allDishes) {
                // Check if review already exists
                const reviewExists = await prisma.review.findFirst({
                    where: {
                        userId: user.id,
                        itemId: dish.id,
                    },
                });

                if (!reviewExists) {
                    await prisma.review.create({
                        data: {
                            itemId: dish.id,
                            userId: user.id,
                            text: getRandomReviewText(),
                            rating: randomRating(),
                        },
                    });
                    console.log(
                        `Created review for dish ${dish.name} by ${user.name}`
                    );
                } else {
                    console.log(
                        `Review for dish ${dish.name} by ${user.name} already exists.`
                    );
                }
            }
        }

        console.log('Database population completed!');
    } catch (error) {
        console.error('Error populating database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
