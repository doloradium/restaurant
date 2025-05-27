'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import MenuItem from '@/components/menu/MenuItem';

interface Category {
    id: string;
    name: string;
}

interface MenuItemType {
    id: string;
    name: string;
    description: string;
    price: number;
    images?: Array<{ id: number; imageUrl: string }>;
    categoryId?: string;
    category?: Category;
    isVegetarian?: boolean;
    isGlutenFree?: boolean;
    isSpicy?: boolean;
}

export default function MenuClient({
    items,
    categories,
    selectedCategory,
}: {
    items: MenuItemType[];
    categories: Category[];
    selectedCategory: string;
}) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState(items);
    const [activeCategory, setActiveCategory] = useState(
        selectedCategory || 'all'
    );
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
    const [dietaryFilters, setDietaryFilters] = useState({
        isVegetarian: false,
        isGlutenFree: false,
        isSpicy: false,
    });
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Initialize filters from URL parameters
    useEffect(() => {
        const category = searchParams.get('category');
        if (category) {
            setActiveCategory(category.toLowerCase());
        }
    }, [searchParams]);

    // Apply filters
    useEffect(() => {
        let result = [...items];

        // Filter by category
        if (activeCategory && activeCategory !== 'all') {
            result = result.filter(
                (item) =>
                    (item.category?.name || '').toLowerCase() ===
                        activeCategory ||
                    (
                        (item.category as unknown as string) || ''
                    ).toLowerCase() === activeCategory
            );
        }

        // Filter by price range
        result = result.filter(
            (item) => item.price >= priceRange[0] && item.price <= priceRange[1]
        );

        // Filter by dietary preferences
        if (dietaryFilters.isVegetarian) {
            result = result.filter((item) => item.isVegetarian);
        }
        if (dietaryFilters.isGlutenFree) {
            result = result.filter((item) => item.isGlutenFree);
        }
        if (dietaryFilters.isSpicy) {
            result = result.filter((item) => item.isSpicy);
        }

        // Filter by search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (item) =>
                    item.name.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query) ||
                    (item.category?.name || item.category || '')
                        .toString()
                        .toLowerCase()
                        .includes(query)
            );
        }

        setFilteredItems(result);
    }, [activeCategory, priceRange, dietaryFilters, searchQuery, items]);

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        // Update URL
        if (category === 'all') {
            router.push('/menu');
        } else {
            router.push(`/menu?category=${category.toLowerCase()}`);
        }
    };

    const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        if (e.target.name === 'min') {
            setPriceRange([value, priceRange[1]]);
        } else {
            setPriceRange([priceRange[0], value]);
        }
    };

    const handleDietaryFilterChange = (filter: keyof typeof dietaryFilters) => {
        setDietaryFilters({
            ...dietaryFilters,
            [filter]: !dietaryFilters[filter],
        });
    };

    const resetFilters = () => {
        setActiveCategory('all');
        setPriceRange([0, 50]);
        setDietaryFilters({
            isVegetarian: false,
            isGlutenFree: false,
            isSpicy: false,
        });
        setSearchQuery('');
        router.push('/menu');
    };

    return (
        <div className='bg-gray-50 min-h-screen'>
            {/* Hero Banner */}
            <div className='bg-gray-900 text-white py-12'>
                <div className='container mx-auto px-4'>
                    <h1 className='text-4xl font-bold mb-4'>Наше меню</h1>
                    <p className='text-gray-300 max-w-2xl'>
                        Исследуйте наш широкий выбор аутентичной японской кухни,
                        включая свежие суши, сашими, роллы и многое другое. Всё
                        приготовлено из лучших ингредиентов.
                    </p>
                </div>
            </div>

            <div className='container mx-auto px-4 py-8'>
                {/* Search and Filter Bar */}
                <div className='mb-8 flex flex-col md:flex-row gap-4 items-center justify-between'>
                    <div className='relative w-full md:w-1/3'>
                        <input
                            type='text'
                            placeholder='Поиск в меню...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                        />
                        <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                    </div>

                    <button
                        className='md:hidden flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-gray-300 text-gray-700'
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        <FaFilter /> Фильтры
                    </button>
                </div>

                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Filters - Desktop */}
                    <div className='hidden lg:block w-64 bg-white p-6 rounded-lg shadow-sm h-fit sticky top-4'>
                        <div className='mb-6'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='font-bold text-gray-800'>
                                    Фильтры
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className='text-sm text-red-600 hover:text-red-800'
                                >
                                    Сбросить
                                </button>
                            </div>

                            <div className='mb-6'>
                                <h4 className='font-medium text-gray-700 mb-2'>
                                    Категории
                                </h4>
                                <div className='space-y-2'>
                                    <div
                                        key='all'
                                        className={`cursor-pointer py-1 px-2 rounded ${
                                            activeCategory === 'all'
                                                ? 'bg-red-100 text-red-700'
                                                : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() =>
                                            handleCategoryChange('all')
                                        }
                                    >
                                        Все
                                    </div>
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className={`cursor-pointer py-1 px-2 rounded ${
                                                activeCategory ===
                                                category.name.toLowerCase()
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                            onClick={() =>
                                                handleCategoryChange(
                                                    category.name.toLowerCase()
                                                )
                                            }
                                        >
                                            {category.name}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='mb-6'>
                                <h4 className='font-medium text-gray-700 mb-2'>
                                    Цена
                                </h4>
                                <div className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm text-gray-600'>
                                            От: ${priceRange[0]}
                                        </span>
                                        <span className='text-sm text-gray-600'>
                                            До: ${priceRange[1]}
                                        </span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <input
                                            type='range'
                                            name='min'
                                            min='0'
                                            max='50'
                                            step='1'
                                            value={priceRange[0]}
                                            onChange={handlePriceRangeChange}
                                            className='w-full'
                                        />
                                        <input
                                            type='range'
                                            name='max'
                                            min='0'
                                            max='50'
                                            step='1'
                                            value={priceRange[1]}
                                            onChange={handlePriceRangeChange}
                                            className='w-full'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className='font-medium text-gray-700 mb-2'>
                                    Диетические опции
                                </h4>
                                <div className='space-y-2'>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={
                                                dietaryFilters.isVegetarian
                                            }
                                            onChange={() =>
                                                handleDietaryFilterChange(
                                                    'isVegetarian'
                                                )
                                            }
                                            className='rounded text-red-600 focus:ring-red-500'
                                        />
                                        <span>Вегетарианское</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={
                                                dietaryFilters.isGlutenFree
                                            }
                                            onChange={() =>
                                                handleDietaryFilterChange(
                                                    'isGlutenFree'
                                                )
                                            }
                                            className='rounded text-red-600 focus:ring-red-500'
                                        />
                                        <span>Без глютена</span>
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer'>
                                        <input
                                            type='checkbox'
                                            checked={dietaryFilters.isSpicy}
                                            onChange={() =>
                                                handleDietaryFilterChange(
                                                    'isSpicy'
                                                )
                                            }
                                            className='rounded text-red-600 focus:ring-red-500'
                                        />
                                        <span>Острое</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    {isMobileFilterOpen && (
                        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end'>
                            <div className='bg-white w-3/4 max-w-sm h-full overflow-y-auto p-6'>
                                <div className='flex justify-between items-center mb-6'>
                                    <h3 className='font-bold text-xl'>
                                        Фильтры
                                    </h3>
                                    <button
                                        onClick={() =>
                                            setIsMobileFilterOpen(false)
                                        }
                                        className='text-gray-500'
                                    >
                                        <FaTimes size={24} />
                                    </button>
                                </div>

                                {/* Mobile filter content - same as desktop but styled for mobile */}
                                <div className='mb-6'>
                                    <div className='flex justify-between items-center mb-4'>
                                        <h4 className='font-medium'>
                                            Категории
                                        </h4>
                                        <button
                                            onClick={resetFilters}
                                            className='text-sm text-red-600'
                                        >
                                            Сбросить
                                        </button>
                                    </div>
                                    <div className='space-y-2'>
                                        <div
                                            key='all-mobile'
                                            className={`cursor-pointer py-2 px-3 rounded ${
                                                activeCategory === 'all'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                            onClick={() => {
                                                handleCategoryChange('all');
                                                setIsMobileFilterOpen(false);
                                            }}
                                        >
                                            Все
                                        </div>
                                        {categories.map((category) => (
                                            <div
                                                key={`${category.id}-mobile`}
                                                className={`cursor-pointer py-2 px-3 rounded ${
                                                    activeCategory ===
                                                    category.name.toLowerCase()
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'hover:bg-gray-100'
                                                }`}
                                                onClick={() => {
                                                    handleCategoryChange(
                                                        category.name.toLowerCase()
                                                    );
                                                    setIsMobileFilterOpen(
                                                        false
                                                    );
                                                }}
                                            >
                                                {category.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Mobile price and dietary filters - same as desktop */}
                                {/* ... */}
                            </div>
                        </div>
                    )}

                    {/* Menu Items Grid */}
                    <div className='flex-1'>
                        <div className='mb-6'>
                            <h2 className='text-2xl font-bold text-gray-800'>
                                {activeCategory === 'all'
                                    ? 'Все блюда'
                                    : categories.find(
                                          (c) =>
                                              c.name.toLowerCase() ===
                                              activeCategory
                                      )?.name || 'Блюда'}
                            </h2>
                            <p className='text-gray-500'>
                                {filteredItems.length} блюд найдено
                            </p>
                        </div>

                        {filteredItems.length === 0 ? (
                            <div className='bg-white p-8 rounded-lg shadow-sm text-center'>
                                <p className='text-gray-500 mb-4'>
                                    По вашему запросу ничего не найдено.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className='text-red-600 hover:text-red-800 font-medium'
                                >
                                    Сбросить фильтры
                                </button>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {filteredItems.map((item) => (
                                    <MenuItem
                                        key={item.id}
                                        id={item.id}
                                        name={item.name}
                                        description={item.description}
                                        price={item.price}
                                        images={item.images}
                                        categoryId={
                                            item.categoryId || item.category?.id
                                        }
                                        categoryName={item.category?.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
