'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import MenuItem from '@/components/menu/MenuItem';

interface Category {
    id: string;
    name: string;
    originalName?: string; // Original English name for API calls
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
    const [filteredItems, setFilteredItems] = useState<MenuItemType[]>([]);
    const [activeCategory, setActiveCategory] = useState(
        selectedCategory || 'all'
    );

    // Calculate the maximum price from items for the price range
    const maxItemPrice = Math.max(
        ...items.map((item) => Number(item.price) || 0),
        100
    );

    // Initialize priceRange state with proper defaults
    const [priceRange, setPriceRange] = useState<[number, number]>([
        0,
        maxItemPrice || 1000,
    ]);

    // Set filtered items when items change
    useEffect(() => {
        setFilteredItems(items);
    }, [items]);

    // Add useEffect to update price range when items change
    useEffect(() => {
        if (items.length > 0) {
            const newMax = Math.max(
                ...items.map((item) => Number(item.price) || 0),
                100
            );
            setPriceRange([0, newMax]);
        }
    }, [items]);

    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Initialize filters from URL parameters
    useEffect(() => {
        const category = searchParams.get('category');

        if (category) {
            // Check if the category is 'all' or a specific ID
            if (category === 'all') {
                setActiveCategory('all');
            } else {
                // Try to find a category with matching ID by converting both to strings
                const matchingCategory = categories.find(
                    (cat) => String(cat.id) === String(category)
                );

                if (matchingCategory) {
                    setActiveCategory(String(category)); // Use the ID directly
                } else {
                    setActiveCategory('all');
                }
            }
        } else if (selectedCategory) {
            // If no category in searchParams but selectedCategory is provided
            setActiveCategory(selectedCategory);
        }
    }, [searchParams, categories, selectedCategory]);

    // Apply filters
    useEffect(() => {
        // If no items yet, don't try to filter
        if (items.length === 0) {
            return;
        }

        let result = [...items];

        // Filter by category ID
        if (activeCategory && activeCategory !== 'all') {
            result = result.filter((item) => {
                // Convert to strings before comparison to handle potential type mismatches
                const itemCategoryId = String(item.categoryId);
                const activeCategoryId = String(activeCategory);
                const categoryId = item.category
                    ? String(item.category.id)
                    : '';

                return (
                    itemCategoryId === activeCategoryId ||
                    categoryId === activeCategoryId
                );
            });
        }

        // Filter by price range - make sure both item.price and priceRange values are compared as numbers
        result = result.filter((item) => {
            const itemPrice = Number(item.price);
            return itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
        });

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
    }, [activeCategory, priceRange, searchQuery, items]);

    const handleCategoryChange = (categoryId: string) => {
        setActiveCategory(categoryId);

        // Update URL
        if (categoryId === 'all') {
            router.push('/menu');
        } else {
            router.push(`/menu?category=${categoryId}`);
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

    const resetFilters = () => {
        setActiveCategory('all');
        setPriceRange([0, maxItemPrice]);
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
                <div className='mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between'>
                    <div className='relative w-full sm:w-1/2 md:w-1/3'>
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
                        className='lg:hidden flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-md shadow-md w-full sm:w-auto'
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        <FaFilter /> Фильтры и категории
                    </button>
                </div>

                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Filters - Desktop (visible on large screens) */}
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
                                    <button
                                        key='all'
                                        onClick={() =>
                                            handleCategoryChange('all')
                                        }
                                        className={`px-3 py-1 rounded text-sm ${
                                            activeCategory === 'all'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-200 text-gray-800'
                                        }`}
                                    >
                                        Все
                                    </button>

                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                handleCategoryChange(
                                                    String(category.id)
                                                )
                                            }
                                            className={`px-3 py-1 rounded text-sm ${
                                                String(activeCategory) ===
                                                String(category.id)
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-200 text-gray-800'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
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
                                            От: ₽{Math.floor(priceRange[0])}
                                        </span>
                                        <span className='text-sm text-gray-600'>
                                            До: ₽{Math.ceil(priceRange[1])}
                                        </span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <input
                                            type='range'
                                            name='min'
                                            min='0'
                                            max={maxItemPrice}
                                            step={Math.ceil(maxItemPrice / 50)}
                                            value={priceRange[0]}
                                            onChange={handlePriceRangeChange}
                                            className='w-full'
                                        />
                                        <input
                                            type='range'
                                            name='max'
                                            min='0'
                                            max={maxItemPrice}
                                            step={Math.ceil(maxItemPrice / 50)}
                                            value={priceRange[1]}
                                            onChange={handlePriceRangeChange}
                                            className='w-full'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters (visible on small to medium screens) */}
                    {isMobileFilterOpen && (
                        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end overflow-hidden'>
                            <div className='bg-white w-full max-w-sm h-full overflow-y-auto p-6 animate-slide-in'>
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
                                                    String(activeCategory) ===
                                                    String(category.id)
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'hover:bg-gray-100'
                                                }`}
                                                onClick={() => {
                                                    handleCategoryChange(
                                                        String(category.id)
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

                                {/* Mobile price filter */}
                                <div className='mb-6'>
                                    <h4 className='font-medium text-gray-700 mb-2'>
                                        Цена
                                    </h4>
                                    <div className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm text-gray-600'>
                                                От: ₽{Math.floor(priceRange[0])}
                                            </span>
                                            <span className='text-sm text-gray-600'>
                                                До: ₽{Math.ceil(priceRange[1])}
                                            </span>
                                        </div>
                                        <div className='flex gap-2'>
                                            <input
                                                type='range'
                                                name='min'
                                                min='0'
                                                max={maxItemPrice}
                                                step={Math.ceil(
                                                    maxItemPrice / 50
                                                )}
                                                value={priceRange[0]}
                                                onChange={
                                                    handlePriceRangeChange
                                                }
                                                className='w-full'
                                            />
                                            <input
                                                type='range'
                                                name='max'
                                                min='0'
                                                max={maxItemPrice}
                                                step={Math.ceil(
                                                    maxItemPrice / 50
                                                )}
                                                value={priceRange[1]}
                                                onChange={
                                                    handlePriceRangeChange
                                                }
                                                className='w-full'
                                            />
                                        </div>
                                    </div>
                                </div>
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
                                              String(c.id) ===
                                              String(activeCategory)
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
