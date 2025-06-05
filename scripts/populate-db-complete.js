const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Russian names for users
const userNames = [
    // Admin
    {
        role: 'ADMIN',
        name: 'Админ',
        surname: 'Администратов',
        email: 'admin@restaurant.com',
    },
    // Cook
    {
        role: 'COOK',
        name: 'Иван',
        surname: 'Поваренко',
        email: 'cook@restaurant.com',
    },
    // Courier
    {
        role: 'COURIER',
        name: 'Дмитрий',
        surname: 'Курьеров',
        email: 'courier@restaurant.com',
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
    // User 4
    {
        role: 'USER',
        name: 'Сергей',
        surname: 'Кузнецов',
        email: 'user4@example.com',
    },
    // User 5
    {
        role: 'USER',
        name: 'Анна',
        surname: 'Соколова',
        email: 'user5@example.com',
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
    {
        city: 'Екатеринбург',
        street: 'Ленина',
        houseNumber: '54',
        apartment: '23',
        entrance: '2',
        floor: '3',
        intercom: '2345',
    },
    {
        city: 'Казань',
        street: 'Баумана',
        houseNumber: '18',
        apartment: '76',
        entrance: '1',
        floor: '8',
        intercom: '7654',
    },
    {
        city: 'Новосибирск',
        street: 'Красный проспект',
        houseNumber: '42',
        apartment: '15',
        entrance: '3',
        floor: '4',
        intercom: '1598',
    },
    {
        city: 'Нижний Новгород',
        street: 'Большая Покровская',
        houseNumber: '21',
        apartment: '39',
        entrance: '2',
        floor: '5',
        intercom: '3978',
    },
    {
        city: 'Москва',
        street: 'Пятницкая',
        houseNumber: '30',
        apartment: '12',
        entrance: '1',
        floor: '3',
        intercom: '1234',
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
];

// Function to generate a random price between 200 and 1000
const randomPrice = () => Math.floor(Math.random() * 800) + 200;

// Complete list of dishes for each category (3 per category)
const allDishes = [
    // Category 1: Супы (Soups)
    {
        name: 'Борщ',
        description:
            'Классический украинский борщ со свининой, свеклой и капустой. Подается с долькой сметаны и свежей зеленью. Насыщенный вкус и аромат этого блюда не оставит равнодушным даже самого требовательного гурмана. Особый способ приготовления позволяет сохранить все полезные свойства овощей. Идеален для согревающего обеда в холодный день.',
        price: randomPrice(),
        categoryId: 1,
    },
    {
        name: 'Куриный суп с лапшой',
        description:
            'Легкий куриный суп с домашней лапшой и овощами. Приготовлен на наваристом бульоне из фермерской курицы. Содержит морковь, лук, сельдерей и свежую зелень. Блюдо обладает нежным вкусом и согревающим эффектом. Идеальное решение для восстановления сил и укрепления иммунитета.',
        price: randomPrice(),
        categoryId: 1,
    },
    {
        name: 'Грибной крем-суп',
        description:
            'Нежный крем-суп из белых грибов со сливками и трюфельным маслом. Блюдо сочетает в себе изысканный аромат лесных грибов и нежную сливочную текстуру. Подается с гренками из бородинского хлеба и веточкой свежего тимьяна. Каждая ложка этого супа подарит вам незабываемое гастрономическое удовольствие. Настоящий деликатес для ценителей грибных блюд.',
        price: randomPrice(),
        categoryId: 1,
    },

    // Category 2: Салаты (Salads)
    {
        name: 'Цезарь с курицей',
        description:
            'Классический салат Цезарь с сочной куриной грудкой, хрустящими гренками, листьями романо и фирменным соусом. Блюдо украшено стружкой пармезана и помидорами черри. Идеальное сочетание свежести и насыщенного вкуса. Все ингредиенты тщательно отбираются нашими поварами для достижения идеального баланса вкуса. Подается в глубокой тарелке с отдельным соусником.',
        price: randomPrice(),
        categoryId: 2,
    },
    {
        name: 'Греческий салат',
        description:
            'Традиционный греческий салат с крупными кусочками свежих овощей, оливками Каламата и сыром фета. Заправлен оливковым маслом и бальзамическим уксусом. Содержит огурцы, помидоры, болгарский перец и красный лук. В каждом кусочке чувствуется свежесть средиземноморской кухни. Освежающее блюдо, идеальное для легкого ужина или перекуса в течение дня.',
        price: randomPrice(),
        categoryId: 2,
    },
    {
        name: 'Оливье с телятиной',
        description:
            'Изысканная версия традиционного русского салата Оливье с нежной телятиной, свежими овощами и отварным картофелем. Приготовлен на основе домашнего майонеза по секретному рецепту нашего шеф-повара. В составе также присутствуют зеленый горошек, морковь и маринованные огурцы собственного приготовления. Украшен перепелиными яйцами и свежей зеленью. Незаменимое блюдо для праздничного стола.',
        price: randomPrice(),
        categoryId: 2,
    },

    // Category 3: Горячие блюда (Main courses)
    {
        name: 'Котлета по-киевски',
        description:
            'Сочная котлета из куриного филе с начинкой из сливочного масла и трав. Панирована в хрустящих сухарях и обжарена до золотистой корочки. При разрезании выделяется ароматное масло с зеленью, создавая неповторимый вкусовой эффект. Приготовлена по классическому рецепту с соблюдением всех кулинарных традиций. Подается с картофельным пюре и свежими овощами.',
        price: randomPrice(),
        categoryId: 3,
    },
    {
        name: 'Говядина по-строгановски',
        description:
            'Нежные кусочки говяжьей вырезки, тушенные в сметанном соусе с грибами и луком. Блюдо обладает богатым вкусом и изысканным ароматом. Приготовлено по старинному русскому рецепту из отборного мяса высшего качества. Говядина предварительно маринуется в специальном составе для достижения особой мягкости. Подается с отварным картофелем или гречневой кашей.',
        price: randomPrice(),
        categoryId: 3,
    },
    {
        name: 'Филе судака с овощами',
        description:
            'Филе судака, запеченное с сезонными овощами под сырной корочкой. Нежная рыба сохраняет свой сок и аромат благодаря специальному способу приготовления. Овощной гарнир включает цукини, болгарский перец и помидоры черри. Блюдо готовится в специальной печи при оптимальной температуре, что позволяет сохранить все полезные свойства продуктов. Украшено свежей зеленью и дольками лимона.',
        price: randomPrice(),
        categoryId: 3,
    },

    // Category 4: Десерты (Desserts)
    {
        name: 'Наполеон',
        description:
            'Классический слоеный торт с нежным заварным кремом. Каждый слой выпекается отдельно до золотистой корочки. Крем готовится по старинному рецепту из свежих фермерских яиц и натуральной ванили. Десерт пропитывается в течение суток для достижения идеальной текстуры. Подается с ягодным соусом и свежими ягодами сезона.',
        price: randomPrice(),
        categoryId: 4,
    },
    {
        name: 'Чизкейк Нью-Йорк',
        description:
            'Классический американский чизкейк с нежной текстурой и ярким вкусом. Основа приготовлена из песочного теста с добавлением сливочного масла. Начинка содержит высококачественный сливочный сыр, натуральную ваниль и цедру лимона. Выпекается при низкой температуре для достижения идеальной консистенции. Подается с малиновым соусом и свежими ягодами.',
        price: randomPrice(),
        categoryId: 4,
    },
    {
        name: 'Тирамису',
        description:
            'Итальянский десерт на основе сыра маскарпоне с добавлением кофе и какао. Печенье савоярди пропитано эспрессо с добавлением ликера амаретто. Крем готовится из свежего маскарпоне с добавлением яиц и сахара. Десерт настаивается несколько часов для насыщения вкуса. Подается в порционной стеклянной креманке, посыпанный какао и украшенный кофейными зернами.',
        price: randomPrice(),
        categoryId: 4,
    },

    // Category 5: Напитки (Drinks)
    {
        name: 'Клюквенный морс',
        description:
            'Освежающий напиток из свежей клюквы с добавлением меда и специй. Клюква собрана в экологически чистых районах северных лесов. Морс готовится по традиционному русскому рецепту с минимальной термической обработкой для сохранения витаминов. Обладает ярким вкусом с приятной кислинкой и легкой сладостью. Идеально подходит для утоления жажды и укрепления иммунитета.',
        price: randomPrice(),
        categoryId: 5,
    },
    {
        name: 'Имбирный лимонад',
        description:
            'Освежающий домашний лимонад с имбирем, лимоном и мятой. Готовится из свежих ингредиентов без использования искусственных добавок. Имбирь придает напитку пикантную остроту и согревающий эффект. Сладость регулируется натуральным медом или тростниковым сахаром. Подается со льдом, украшенный долькой лимона и веточкой свежей мяты.',
        price: randomPrice(),
        categoryId: 5,
    },
    {
        name: 'Ягодный смузи',
        description:
            'Питательный смузи из сезонных ягод с добавлением греческого йогурта. В составе черника, малина, клубника – богатые антиоксидантами и витаминами. Йогурт добавляет кремовую текстуру и полезные пробиотики. Натуральный мед используется в качестве подсластителя. Напиток взбивается непосредственно перед подачей для сохранения свежести и питательных свойств. Идеален для легкого и полезного завтрака.',
        price: randomPrice(),
        categoryId: 5,
    },

    // Category 6: Закуски (Appetizers)
    {
        name: 'Сырная тарелка',
        description:
            'Изысканная композиция из пяти видов сыра различной выдержки и происхождения. В набор входят: камамбер, пармезан, горгонзола, грюйер и козий сыр. Сыры тщательно отбираются нашими сомелье и поставляются от лучших европейских производителей. Подается с медом, виноградом, грецкими орехами и хрустящими гриссини. Идеальное дополнение к бокалу вина или аперитиву.',
        price: randomPrice(),
        categoryId: 6,
    },
    {
        name: 'Брускетта с томатами',
        description:
            'Классическая итальянская закуска на основе хрустящего багета с ароматными томатами и базиликом. Хлеб обжаривается на гриле с оливковым маслом до золотистой корочки. Томаты используются нескольких сортов для богатства вкуса. Заправляется бальзамическим кремом и оливковым маслом первого отжима. Свежий базилик добавляет яркий аромат. Подается теплой сразу после приготовления.',
        price: randomPrice(),
        categoryId: 6,
    },
    {
        name: 'Тартар из лосося',
        description:
            'Изысканный тартар из свежего лосося с авокадо и цитрусовой заправкой. Лосось мелко нарезается и смешивается с каперсами, луком шалот и дижонской горчицей. Авокадо добавляет кремовую текстуру и богатый вкус. Цитрусовая заправка состоит из сока и цедры лимона, оливкового масла и свежих трав. Блюдо украшается икрой летучей рыбы и микрозеленью. Подается с хрустящими тостами из ржаного хлеба.',
        price: randomPrice(),
        categoryId: 6,
    },

    // Category 7: Пицца (Pizza)
    {
        name: 'Маргарита',
        description:
            'Классическая итальянская пицца с томатным соусом, моцареллой и свежим базиликом. Тесто готовится по традиционному неаполитанскому рецепту и выдерживается 24 часа. Томатный соус варится из спелых итальянских помидоров сорта Сан Марцано. Моцарелла используется свежая, высшего качества. Выпекается в дровяной печи при температуре 450 градусов в течение 90 секунд. Подается с оливковым маслом первого отжима.',
        price: randomPrice(),
        categoryId: 7,
    },
    {
        name: 'Пепперони',
        description:
            'Американская пицца с острой салями пепперони и сыром моцарелла. Тесто тонкое, с хрустящими бортиками. Томатный соус готовится по фирменному рецепту с добавлением итальянских трав. Пепперони нарезается тонкими ломтиками и равномерно распределяется по поверхности. Сыр используется в комбинации – моцарелла и пармезан для богатства вкуса. Выпекается до образования золотистой корочки. Подается с острым перцем чили на выбор.',
        price: randomPrice(),
        categoryId: 7,
    },
    {
        name: 'Четыре сыра',
        description:
            'Изысканная пицца с комбинацией четырех сыров: моцарелла, горгонзола, пармезан и рикотта. Основа из тонкого теста покрывается нежным сливочным соусом вместо традиционного томатного. Сыры распределяются слоями для создания гармоничного вкуса. Края пиццы смазываются оливковым маслом для золотистой корочки. Выпекается до идеального расплавления сыров с сохранением их индивидуальных вкусовых качеств. Подается с медом для тех, кто любит контраст сладкого и соленого.',
        price: randomPrice(),
        categoryId: 7,
    },

    // Category 8: Суши и роллы (Sushi and rolls)
    {
        name: 'Филадельфия ролл',
        description:
            'Популярный ролл с нежным лососем, сливочным сыром и авокадо. Готовится из высококачественного риса сорта калроуз, специально предназначенного для суши. Лосось используется охлажденный, нарезанный тонкими ломтиками. Сливочный сыр придает кремовую текстуру и нежный вкус. Авокадо добавляется в идеальной степени зрелости. Ролл украшается икрой тобико и подается с соевым соусом, имбирем и васаби.',
        price: randomPrice(),
        categoryId: 8,
    },
    {
        name: 'Калифорния ролл',
        description:
            'Классический ролл с крабовым мясом, авокадо и огурцом, обернутый в тобико. Рис специально подготавливается с добавлением рисового уксуса и сахара для достижения идеального вкуса. Крабовое мясо используется высшего качества. Авокадо и огурец добавляют свежесть и хрустящую текстуру. Внешний слой из икры летучей рыбы тобико придает яркий вид и дополнительный вкусовой акцент. Подается с соевым соусом пониженной солености и свежим васаби.',
        price: randomPrice(),
        categoryId: 8,
    },
    {
        name: 'Дракон ролл',
        description:
            'Эффектный ролл с угрем, огурцом и авокадо, украшенный тонкими ломтиками авокадо в форме чешуи дракона. Внутри ролла – хрустящая темпура, добавляющая интересную текстуру. Угорь предварительно обжаривается и глазируется сладким соусом унаги. Рис приготовлен по традиционной японской технологии с точным соблюдением пропорций воды и риса. Ролл украшается икрой тобико и кунжутом. Подается с фирменным соевым соусом и маринованным имбирем.',
        price: randomPrice(),
        categoryId: 8,
    },
];

// Review texts for variation
const reviewTexts = [
    'Отличное блюдо! Вкус превзошел все мои ожидания. Буду заказывать снова и рекомендовать друзьям.',
    'Очень вкусно, но порция могла бы быть больше. В целом остался доволен качеством приготовления.',
    'Идеальное сочетание ингредиентов. Свежо, оригинально и невероятно вкусно. Однозначно стоит своих денег.',
    'Хорошее блюдо, но немного пересоленное на мой вкус. В следующий раз попрошу уменьшить количество соли.',
    'Превосходно! Давно не пробовал ничего вкуснее. Повар – настоящий мастер своего дела.',
    'Достойное блюдо, но цена немного завышена. Вкус хороший, но не соответствует стоимости.',
    'Очень оригинальная подача и потрясающий вкус. Настоящее произведение кулинарного искусства.',
    'Свежие ингредиенты и отличное приготовление. Чувствуется, что в ресторане работают профессионалы.',
    'Неплохо, но я ожидал большего за эту цену. Есть куда стремиться в плане вкуса и презентации.',
    'Восхитительно! Каждый кусочек - настоящее наслаждение. Определенно буду заказывать еще.',
    'Блюдо удивило своим насыщенным вкусом. Все ингредиенты гармонично сочетаются между собой.',
    'Качество продуктов на высшем уровне. Видно, что шеф-повар тщательно подбирает каждый ингредиент.',
    'Немного необычный вкус, но очень интересный. Понравилось экспериментировать с новыми сочетаниями.',
    'Прекрасное соотношение цены и качества. Большая порция, которой хватило на весь вечер.',
    'Аромат блюда почувствовался еще до того, как его принесли. Вкус не разочаровал!',
];

// Russian user names for reviews
const reviewerNames = [
    { name: 'Иван', surname: 'Петров' },
    { name: 'Анна', surname: 'Иванова' },
    { name: 'Дмитрий', surname: 'Сидоров' },
    { name: 'Елена', surname: 'Смирнова' },
    { name: 'Алексей', surname: 'Козлов' },
    { name: 'Ольга', surname: 'Новикова' },
    { name: 'Сергей', surname: 'Морозов' },
    { name: 'Наталья', surname: 'Волкова' },
    { name: 'Михаил', surname: 'Соколов' },
    { name: 'Татьяна', surname: 'Лебедева' },
];

// Function to generate a random rating between 3 and 5
const randomRating = () => Math.floor(Math.random() * 3) + 3;

// Function to get a random review text
const getRandomReviewText = () =>
    reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

// Function to get a random reviewer name
const getRandomReviewer = () =>
    reviewerNames[Math.floor(Math.random() * reviewerNames.length)];

// Function to get a random address from the sample addresses
const getRandomAddress = () =>
    sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

async function main() {
    try {
        console.log('Начинаем заполнение базы данных...');

        // 1. Create users including ADMIN
        for (const userData of userNames) {
            const userExists = await prisma.user.findFirst({
                where: { email: userData.email },
            });

            if (!userExists) {
                await prisma.user.create({
                    data: {
                        name: userData.name,
                        surname: userData.surname,
                        email: userData.email,
                        role: userData.role,
                        passwordHash:
                            '$2b$10$rtnnuMlfNMst9YL4T.gz1.qkQgRaedaaongGJc53RGKk6qpGdlr0.', // password: 'password123'
                    },
                });
                console.log(
                    `Создан пользователь: ${userData.name} ${userData.surname} (${userData.role})`
                );
            } else {
                console.log(`Пользователь ${userData.email} уже существует.`);
            }
        }

        // 2. Create two addresses for each USER
        const users = await prisma.user.findMany({
            where: { role: 'USER' },
        });

        for (const user of users) {
            // Check if user already has addresses
            const userAddresses = await prisma.address.findMany({
                where: { userId: user.id },
            });

            // Make sure each USER has exactly 2 addresses
            if (userAddresses.length < 2) {
                // Clear existing addresses to ensure exactly 2
                if (userAddresses.length > 0) {
                    for (const address of userAddresses) {
                        await prisma.address.delete({
                            where: { id: address.id },
                        });
                    }
                }

                // Create first address
                const address1 = getRandomAddress();
                await prisma.address.create({
                    data: {
                        userId: user.id,
                        ...address1,
                    },
                });
                console.log(
                    `Создан первый адрес для пользователя ${user.name}`
                );

                // Create second address (ensure it's different)
                let address2 = getRandomAddress();
                while (
                    address2.street === address1.street &&
                    address2.houseNumber === address1.houseNumber
                ) {
                    address2 = getRandomAddress();
                }

                await prisma.address.create({
                    data: {
                        userId: user.id,
                        ...address2,
                    },
                });
                console.log(
                    `Создан второй адрес для пользователя ${user.name}`
                );
            } else if (userAddresses.length === 2) {
                console.log(`Пользователь ${user.name} уже имеет 2 адреса.`);
            } else {
                console.log(
                    `Пользователь ${user.name} имеет ${userAddresses.length} адресов, корректируем...`
                );
                // Delete excess addresses
                for (let i = 2; i < userAddresses.length; i++) {
                    await prisma.address.delete({
                        where: { id: userAddresses[i].id },
                    });
                }
            }
        }

        // 3. Create categories
        for (const category of categories) {
            const categoryExists = await prisma.category.findFirst({
                where: { name: category.name },
            });

            if (!categoryExists) {
                await prisma.category.create({
                    data: category,
                });
                console.log(`Создана категория: ${category.name}`);
            } else {
                console.log(`Категория ${category.name} уже существует.`);
            }
        }

        // 4. Create dishes (3 per category)
        for (const dish of allDishes) {
            const dishExists = await prisma.item.findFirst({
                where: { name: dish.name },
            });

            if (!dishExists) {
                const createdDish = await prisma.item.create({
                    data: dish,
                });
                console.log(`Создано блюдо: ${dish.name}`);
            } else {
                console.log(`Блюдо ${dish.name} уже существует.`);
            }
        }

        // 5. Create reviews (3 per dish)
        // First get all users with USER role for reviews
        const regularUsers = await prisma.user.findMany({
            where: { role: 'USER' },
        });

        // Get all dishes
        const dishes = await prisma.item.findMany();

        // For each dish, create 3 reviews
        for (const dish of dishes) {
            // Check if dish already has reviews
            const existingReviews = await prisma.review.count({
                where: { itemId: dish.id },
            });

            if (existingReviews < 3) {
                // Remove existing reviews first to ensure exactly 3
                if (existingReviews > 0) {
                    await prisma.review.deleteMany({
                        where: { itemId: dish.id },
                    });
                }

                // Create 3 reviews for this dish
                for (let i = 0; i < 3; i++) {
                    // Get a random user for the review
                    const randomUser =
                        regularUsers[
                            Math.floor(Math.random() * regularUsers.length)
                        ];

                    await prisma.review.create({
                        data: {
                            itemId: dish.id,
                            userId: randomUser.id,
                            text: getRandomReviewText(),
                            rating: randomRating(),
                        },
                    });
                }
                console.log(`Созданы 3 отзыва для блюда: ${dish.name}`);
            } else {
                console.log(
                    `Блюдо ${dish.name} уже имеет ${existingReviews} отзывов.`
                );
            }
        }

        console.log('База данных успешно заполнена!');
    } catch (error) {
        console.error('Ошибка при заполнении базы данных:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
