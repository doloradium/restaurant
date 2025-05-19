'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    FaSearch,
    FaStar,
    FaShoppingCart,
    FaFilter,
    FaTimes,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const categories = [
    'All',
    'Nigiri',
    'Rolls',
    'Special Rolls',
    'Sashimi',
    'Vegetarian',
];

export default function MenuClient({ items }: { items: any[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredItems, setFilteredItems] = useState(items);
    const [selectedCategory, setSelectedCategory] = useState('All');
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
        if (
            category &&
            categories
                .map((c) => c.toLowerCase())
                .includes(category.toLowerCase())
        ) {
            setSelectedCategory(
                categories.find(
                    (c) => c.toLowerCase() === category.toLowerCase()
                ) || 'All'
            );
        }
    }, [searchParams]);

    // Apply filters
    useEffect(() => {
        let result = [...items];

        // Filter by category
        if (selectedCategory !== 'All') {
            result = result.filter(
                (item) =>
                    item.category?.name === selectedCategory ||
                    item.category === selectedCategory
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
                        .toLowerCase()
                        .includes(query)
            );
        }

        setFilteredItems(result);
    }, [selectedCategory, priceRange, dietaryFilters, searchQuery, items]);

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        // Update URL
        if (category === 'All') {
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
        setSelectedCategory('All');
        setPriceRange([0, 50]);
        setDietaryFilters({
            isVegetarian: false,
            isGlutenFree: false,
            isSpicy: false,
        });
        setSearchQuery('');
        router.push('/menu');
    };

    const addToCart = (item: any) => {
        toast.success(`${item.name} added to cart!`);
    };

    return (
        <div className='bg-gray-50 min-h-screen'>
            {/* Hero Banner */}
            <div className='bg-gray-900 text-white py-12'>
                <div className='container mx-auto px-4'>
                    <h1 className='text-4xl font-bold mb-4'>Our Menu</h1>
                    <p className='text-gray-300 max-w-2xl'>
                        Explore our wide selection of authentic Japanese
                        cuisine, including fresh sushi, sashimi, maki rolls, and
                        more. All made with the finest ingredients.
                    </p>
                </div>
            </div>

            <div className='container mx-auto px-4 py-8'>
                {/* Search and Filter Bar */}
                <div className='mb-8 flex flex-col md:flex-row gap-4 items-center justify-between'>
                    <div className='relative w-full md:w-1/3'>
                        <input
                            type='text'
                            placeholder='Search menu...'
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
                        <FaFilter /> Filters
                    </button>
                </div>

                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Filters - Desktop */}
                    <div className='hidden lg:block w-64 bg-white p-6 rounded-lg shadow-sm h-fit sticky top-4'>
                        <div className='mb-6'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='font-bold text-gray-800'>
                                    Filters
                                </h3>
                                <button
                                    onClick={resetFilters}
                                    className='text-sm text-red-600 hover:text-red-800'
                                >
                                    Reset All
                                </button>
                            </div>

                            <div className='mb-6'>
                                <h4 className='font-medium text-gray-700 mb-2'>
                                    Categories
                                </h4>
                                <div className='space-y-2'>
                                    {categories.map((category) => (
                                        <div
                                            key={category}
                                            className='flex items-center'
                                        >
                                            <button
                                                className={`w-full text-left py-1 px-2 rounded hover:bg-gray-100 ${
                                                    selectedCategory ===
                                                    category
                                                        ? 'bg-red-50 text-red-600 font-medium'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    handleCategoryChange(
                                                        category
                                                    )
                                                }
                                            >
                                                {category}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='mb-6'>
                                <h4 className='font-medium text-gray-700 mb-2'>
                                    Price Range
                                </h4>
                                <div className='flex gap-4 items-center'>
                                    <div className='flex-1'>
                                        <label className='text-xs text-gray-500'>
                                            Min
                                        </label>
                                        <div className='relative mt-1'>
                                            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                                                $
                                            </span>
                                            <input
                                                type='number'
                                                name='min'
                                                min='0'
                                                max={priceRange[1]}
                                                value={priceRange[0]}
                                                onChange={
                                                    handlePriceRangeChange
                                                }
                                                className='w-full pl-8 pr-2 py-1 border border-gray-300 rounded'
                                            />
                                        </div>
                                    </div>
                                    <div className='flex-1'>
                                        <label className='text-xs text-gray-500'>
                                            Max
                                        </label>
                                        <div className='relative mt-1'>
                                            <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                                                $
                                            </span>
                                            <input
                                                type='number'
                                                name='max'
                                                min={priceRange[0]}
                                                value={priceRange[1]}
                                                onChange={
                                                    handlePriceRangeChange
                                                }
                                                className='w-full pl-8 pr-2 py-1 border border-gray-300 rounded'
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className='font-medium text-gray-700 mb-2'>
                                    Dietary Preferences
                                </h4>
                                <div className='space-y-2'>
                                    <label className='flex items-center'>
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
                                            className='h-4 w-4 text-red-600 rounded'
                                        />
                                        <span className='ml-2 text-gray-700'>
                                            Vegetarian
                                        </span>
                                    </label>
                                    <label className='flex items-center'>
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
                                            className='h-4 w-4 text-red-600 rounded'
                                        />
                                        <span className='ml-2 text-gray-700'>
                                            Gluten-Free
                                        </span>
                                    </label>
                                    <label className='flex items-center'>
                                        <input
                                            type='checkbox'
                                            checked={dietaryFilters.isSpicy}
                                            onChange={() =>
                                                handleDietaryFilterChange(
                                                    'isSpicy'
                                                )
                                            }
                                            className='h-4 w-4 text-red-600 rounded'
                                        />
                                        <span className='ml-2 text-gray-700'>
                                            Spicy
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Filters */}
                    {isMobileFilterOpen && (
                        <div className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end'>
                            <div className='bg-white w-4/5 h-full overflow-y-auto p-6'>
                                <div className='flex justify-between items-center mb-6'>
                                    <h3 className='font-bold text-xl'>
                                        Filters
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

                                <div className='mb-6'>
                                    <h4 className='font-medium text-gray-700 mb-2'>
                                        Categories
                                    </h4>
                                    <div className='space-y-2'>
                                        {categories.map((category) => (
                                            <div
                                                key={category}
                                                className='flex items-center'
                                            >
                                                <button
                                                    className={`w-full text-left py-2 px-3 rounded hover:bg-gray-100 ${
                                                        selectedCategory ===
                                                        category
                                                            ? 'bg-red-50 text-red-600 font-medium'
                                                            : ''
                                                    }`}
                                                    onClick={() => {
                                                        handleCategoryChange(
                                                            category
                                                        );
                                                        setIsMobileFilterOpen(
                                                            false
                                                        );
                                                    }}
                                                >
                                                    {category}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className='mb-6'>
                                    <h4 className='font-medium text-gray-700 mb-2'>
                                        Price Range
                                    </h4>
                                    <div className='flex gap-4 items-center'>
                                        <div className='flex-1'>
                                            <label className='text-xs text-gray-500'>
                                                Min
                                            </label>
                                            <div className='relative mt-1'>
                                                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                                                    $
                                                </span>
                                                <input
                                                    type='number'
                                                    name='min'
                                                    min='0'
                                                    max={priceRange[1]}
                                                    value={priceRange[0]}
                                                    onChange={
                                                        handlePriceRangeChange
                                                    }
                                                    className='w-full pl-8 pr-2 py-2 border border-gray-300 rounded'
                                                />
                                            </div>
                                        </div>
                                        <div className='flex-1'>
                                            <label className='text-xs text-gray-500'>
                                                Max
                                            </label>
                                            <div className='relative mt-1'>
                                                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>
                                                    $
                                                </span>
                                                <input
                                                    type='number'
                                                    name='max'
                                                    min={priceRange[0]}
                                                    value={priceRange[1]}
                                                    onChange={
                                                        handlePriceRangeChange
                                                    }
                                                    className='w-full pl-8 pr-2 py-2 border border-gray-300 rounded'
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='mb-8'>
                                    <h4 className='font-medium text-gray-700 mb-2'>
                                        Dietary Preferences
                                    </h4>
                                    <div className='space-y-3'>
                                        <label className='flex items-center'>
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
                                                className='h-5 w-5 text-red-600 rounded'
                                            />
                                            <span className='ml-2 text-gray-700'>
                                                Vegetarian
                                            </span>
                                        </label>
                                        <label className='flex items-center'>
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
                                                className='h-5 w-5 text-red-600 rounded'
                                            />
                                            <span className='ml-2 text-gray-700'>
                                                Gluten-Free
                                            </span>
                                        </label>
                                        <label className='flex items-center'>
                                            <input
                                                type='checkbox'
                                                checked={dietaryFilters.isSpicy}
                                                onChange={() =>
                                                    handleDietaryFilterChange(
                                                        'isSpicy'
                                                    )
                                                }
                                                className='h-5 w-5 text-red-600 rounded'
                                            />
                                            <span className='ml-2 text-gray-700'>
                                                Spicy
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className='flex gap-4'>
                                    <button
                                        onClick={resetFilters}
                                        className='flex-1 py-2 border border-gray-300 rounded-md text-gray-700'
                                    >
                                        Reset All
                                    </button>
                                    <button
                                        onClick={() =>
                                            setIsMobileFilterOpen(false)
                                        }
                                        className='flex-1 py-2 bg-red-600 text-white rounded-md'
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Menu Items Grid */}
                    <div className='flex-1'>
                        {filteredItems.length === 0 ? (
                            <div className='bg-white p-8 rounded-lg shadow-sm text-center'>
                                <p className='text-gray-500 text-lg'>
                                    No items found. Try adjusting your filters.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className='mt-4 px-4 py-2 bg-red-600 text-white rounded-md'
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {filteredItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className='bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:-translate-y-1 duration-300'
                                    >
                                        <Link href={`/menu/${item.id}`}>
                                            <div className='h-48 bg-gray-200 relative'>
                                                <div className='h-full w-full bg-gray-300 flex items-center justify-center'>
                                                    {/* Replace with actual images */}
                                                    <span className='text-sm text-gray-500'>
                                                        Item Image
                                                    </span>
                                                </div>
                                                <div className='absolute top-2 right-2 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium'>
                                                    {item.category?.name ||
                                                        item.category}
                                                </div>
                                                {item.isSpicy && (
                                                    <div className='absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium'>
                                                        Spicy
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                        <div className='p-4'>
                                            <div className='flex items-center justify-between mb-2'>
                                                <div className='flex items-center'>
                                                    <FaStar className='text-yellow-400 mr-1' />
                                                    <span className='text-sm text-gray-600'>
                                                        {item.rating ?? '-'} (
                                                        {item.reviews?.length ??
                                                            0}
                                                        )
                                                    </span>
                                                </div>
                                                <span className='text-red-600 font-bold'>
                                                    ${item.price.toFixed(2)}
                                                </span>
                                            </div>
                                            <Link href={`/menu/${item.id}`}>
                                                <h3 className='text-lg font-bold text-gray-800 hover:text-red-600 transition-colors duration-200'>
                                                    {item.name}
                                                </h3>
                                            </Link>
                                            <p className='text-sm text-gray-500 mt-1 mb-4'>
                                                {item.description}
                                            </p>
                                            <div className='flex items-center gap-2'>
                                                <button
                                                    onClick={() =>
                                                        addToCart(item)
                                                    }
                                                    className='flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-200'
                                                >
                                                    <FaShoppingCart /> Add to
                                                    Cart
                                                </button>
                                                <Link
                                                    href={`/menu/${item.id}`}
                                                    className='bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors duration-200'
                                                >
                                                    Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
