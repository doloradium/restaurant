import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const query = req.nextUrl.searchParams.get('query') || '';
        const type = req.nextUrl.searchParams.get('type') || '';

        // Проверка API-ключа - используем правильное имя переменной окружения
        const apiKey = process.env.GEOSUGGEST_KEY;
        if (!apiKey) {
            console.warn(
                'Missing Yandex API key (GEOSUGGEST_KEY), returning backup results'
            );
            return createBackupResults(query, type);
        }

        // Если у нас есть API-ключ, используем реальный API Яндекс.Карт
        // Формируем URL для запроса
        let url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKey}&text=${encodeURIComponent(
            query
        )}&lang=ru_RU&results=5`;

        // Добавляем фильтр типа, если указан
        if (type) {
            url += `&type=${type}`;
        }

        // Выполняем запрос к API
        const response = await fetch(url);

        if (!response.ok) {
            console.error(
                `API request failed: ${response.status} ${response.statusText}`
            );
            return createBackupResults(query, type);
        }

        const data = await response.json();
        return NextResponse.json({ results: data.results || [] });
    } catch (error) {
        console.error('Error in suggest API:', error);
        return NextResponse.json(
            { error: 'Failed to fetch suggestions' },
            { status: 500 }
        );
    }
}

// Создает резервные результаты, когда API не работает
function createBackupResults(query: string, type: string) {
    if (!query) {
        return NextResponse.json({ results: [] });
    }

    // Простая логика для создания фиктивных результатов поиска
    const results = [];

    // Добавляем сам запрос в качестве результата
    results.push({
        title: { text: query },
        subtitle: { text: 'Введенный вами адрес' },
        displayName: query,
        text: query,
        description: 'Используйте как есть',
    });

    // Добавляем дополнительные предложения в зависимости от типа
    if (type === 'locality' || !type) {
        // Предлагаем несколько городов
        const cities = [
            'Москва',
            'Санкт-Петербург',
            'Казань',
            'Новосибирск',
            'Екатеринбург',
        ];
        for (const city of cities) {
            if (
                city.toLowerCase().includes(query.toLowerCase()) ||
                query.length < 3
            ) {
                results.push({
                    title: { text: city },
                    subtitle: { text: 'Город' },
                    displayName: city,
                    text: city,
                    description: 'Город',
                });
            }
        }
    }

    if (type === 'street' || !type) {
        // Предлагаем несколько улиц
        const streets = [
            'Ленина',
            'Пушкина',
            'Гагарина',
            'Советская',
            'Лесная',
        ];
        for (const street of streets) {
            if (
                query.toLowerCase().includes(street.toLowerCase()) ||
                street.toLowerCase().includes(query.toLowerCase()) ||
                query.length < 3
            ) {
                results.push({
                    title: { text: `улица ${street}` },
                    subtitle: { text: 'Улица' },
                    displayName: `улица ${street}`,
                    text: `улица ${street}`,
                    description: 'Улица',
                });
            }
        }
    }

    return NextResponse.json({ results: results.slice(0, 5) });
}
