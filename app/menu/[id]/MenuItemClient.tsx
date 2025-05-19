'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaStar,
    FaShoppingCart,
    FaArrowLeft,
    FaHeart,
    FaRegHeart,
    FaPlus,
    FaMinus,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function MenuItemClient({
    item,
    relatedItems,
    reviews,
}: {
    item: any;
    relatedItems: any[];
    reviews: any[];
}) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    if (!item) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-700 mb-4'>
                        Item Not Found
                    </h2>
                    <p className='text-gray-500 mb-6'>
                        The item you're looking for doesn't exist or has been
                        removed.
                    </p>
                    <Link
                        href='/menu'
                        className='bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition duration-200'
                    >
                        Return to Menu
                    </Link>
                </div>
            </div>
        );
    }

    const handleQuantityChange = (value: number) => {
        if (quantity + value > 0 && quantity + value <= 10) {
            setQuantity(quantity + value);
        }
    };

    const handleAddToCart = () => {
        toast.success(
            `${quantity} ${item.name}${quantity > 1 ? 's' : ''} added to cart!`
        );
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(
            isFavorite ? 'Removed from favorites' : 'Added to favorites'
        );
    };

    return (
        <div className='bg-white'>
            {/* Breadcrumb Navigation */}
            <div className='bg-gray-100 py-3'>
                <div className='container mx-auto px-4'>
                    <div className='flex items-center text-sm text-gray-600'>
                        <Link href='/' className='hover:text-red-600'>
                            Home
                        </Link>
                        <span className='mx-2'>/</span>
                        <Link href='/menu' className='hover:text-red-600'>
                            Menu
                        </Link>
                        <span className='mx-2'>/</span>
                        <Link
                            href={`/menu?category=${
                                item.category?.name?.toLowerCase() ||
                                item.category?.toLowerCase()
                            }`}
                            className='hover:text-red-600'
                        >
                            {item.category?.name || item.category}
                        </Link>
                        <span className='mx-2'>/</span>
                        <span className='text-gray-900 font-medium'>
                            {item.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Product Detail */}
            <div className='container mx-auto px-4 py-8'>
                <button
                    onClick={() => router.back()}
                    className='flex items-center text-gray-600 hover:text-red-600 mb-6'
                >
                    <FaArrowLeft className='mr-2' /> Back to Menu
                </button>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                    {/* Product Images */}
                    <div>
                        <div className='mb-4 aspect-square bg-gray-100 rounded-lg overflow-hidden relative'>
                            <img
                                src={item.image}
                                alt={item.name}
                                className='w-full h-full object-cover'
                            />

                            {/* Favorite Button */}
                            <button
                                onClick={toggleFavorite}
                                className='absolute top-4 right-4 h-10 w-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-red-600 transition duration-200'
                            >
                                {isFavorite ? (
                                    <FaHeart className='text-red-600' />
                                ) : (
                                    <FaRegHeart />
                                )}
                            </button>
                        </div>

                        {/* Thumbnail Images */}
                        {item.images && item.images.length > 0 && (
                            <div className='grid grid-cols-4 gap-4'>
                                {item.images.map(
                                    (image: string, index: number) => (
                                        <div
                                            key={index}
                                            className={`aspect-square rounded-md cursor-pointer overflow-hidden relative ${
                                                activeImageIndex === index
                                                    ? 'ring-2 ring-red-600'
                                                    : 'opacity-70'
                                            }`}
                                            onClick={() =>
                                                setActiveImageIndex(index)
                                            }
                                        >
                                            <img
                                                src={image}
                                                alt={`${item.name} - Image ${
                                                    index + 1
                                                }`}
                                                className='w-full h-full object-cover'
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                            {item.name}
                        </h1>

                        <div className='flex items-center mb-4'>
                            <div className='flex items-center mr-4'>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={`${
                                            i < Math.floor(item.rating)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        } ${
                                            i === Math.floor(item.rating) &&
                                            item.rating % 1 > 0
                                                ? 'text-yellow-200'
                                                : ''
                                        }`}
                                    />
                                ))}
                                <span className='ml-2 text-gray-600'>
                                    {item.rating} ({item.reviews?.length || 0}{' '}
                                    reviews)
                                </span>
                            </div>

                            <div className='text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700'>
                                {item.category?.name || item.category}
                            </div>
                        </div>

                        <div className='text-2xl font-bold text-red-600 mb-4'>
                            ${item.price.toFixed(2)}
                        </div>

                        <p className='text-gray-600 mb-6'>{item.description}</p>

                        {/* Dietary Info */}
                        <div className='mb-6 flex flex-wrap gap-3'>
                            {item.isVegetarian && (
                                <span className='bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full'>
                                    Vegetarian
                                </span>
                            )}
                            {item.isGlutenFree && (
                                <span className='bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full'>
                                    Gluten-Free
                                </span>
                            )}
                            {item.isSpicy && (
                                <span className='bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full'>
                                    Spicy
                                </span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className='mb-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Quantity
                            </label>
                            <div className='flex items-center'>
                                <button
                                    className='h-10 w-10 rounded-l-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100'
                                    onClick={() => handleQuantityChange(-1)}
                                    disabled={quantity <= 1}
                                >
                                    <FaMinus />
                                </button>
                                <input
                                    type='number'
                                    min='1'
                                    max='10'
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(
                                            parseInt(e.target.value) || 1
                                        )
                                    }
                                    className='h-10 w-16 border-t border-b border-gray-300 text-center focus:outline-none'
                                />
                                <button
                                    className='h-10 w-10 rounded-r-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100'
                                    onClick={() => handleQuantityChange(1)}
                                    disabled={quantity >= 10}
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <div className='mb-8'>
                            <button
                                onClick={handleAddToCart}
                                className='w-full py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center'
                            >
                                <FaShoppingCart className='mr-2' />
                                Add to Cart - $
                                {(item.price * quantity).toFixed(2)}
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className='border-t border-gray-200 pt-6'>
                            <div className='flex border-b border-gray-200'>
                                <button
                                    className={`pb-2 px-4 text-sm font-medium ${
                                        activeTab === 'description'
                                            ? 'text-red-600 border-b-2 border-red-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Description
                                </button>
                                <button
                                    className={`pb-2 px-4 text-sm font-medium ${
                                        activeTab === 'ingredients'
                                            ? 'text-red-600 border-b-2 border-red-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveTab('ingredients')}
                                >
                                    Ingredients
                                </button>
                                <button
                                    className={`pb-2 px-4 text-sm font-medium ${
                                        activeTab === 'nutrition'
                                            ? 'text-red-600 border-b-2 border-red-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveTab('nutrition')}
                                >
                                    Nutrition
                                </button>
                                <button
                                    className={`pb-2 px-4 text-sm font-medium ${
                                        activeTab === 'reviews'
                                            ? 'text-red-600 border-b-2 border-red-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveTab('reviews')}
                                >
                                    Reviews ({reviews.length})
                                </button>
                            </div>

                            <div className='py-4'>
                                {activeTab === 'description' && (
                                    <div className='prose max-w-none text-gray-600'>
                                        <p>{item.description}</p>
                                    </div>
                                )}

                                {activeTab === 'ingredients' && (
                                    <div>
                                        <h3 className='font-medium text-gray-900 mb-3'>
                                            Ingredients
                                        </h3>
                                        <ul className='list-disc pl-5 space-y-1 text-gray-600'>
                                            {item.ingredients?.map(
                                                (
                                                    ingredient: string,
                                                    index: number
                                                ) => (
                                                    <li key={index}>
                                                        {ingredient}
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                        <p className='mt-4 text-sm text-gray-500'>
                                            * Allergy information: May contain
                                            traces of soy, fish, shellfish, and
                                            gluten. Please inform staff of any
                                            allergies.
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'nutrition' && (
                                    <div>
                                        <h3 className='font-medium text-gray-900 mb-3'>
                                            Nutritional Information
                                        </h3>
                                        <p className='text-sm text-gray-500 mb-3'>
                                            Per serving (1 piece)
                                        </p>

                                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4'>
                                            <div className='bg-gray-50 p-3 rounded-md text-center'>
                                                <div className='text-sm text-gray-500'>
                                                    Calories
                                                </div>
                                                <div className='font-bold text-gray-900'>
                                                    {
                                                        item.nutritionalInfo
                                                            ?.calories
                                                    }
                                                </div>
                                            </div>
                                            <div className='bg-gray-50 p-3 rounded-md text-center'>
                                                <div className='text-sm text-gray-500'>
                                                    Protein
                                                </div>
                                                <div className='font-bold text-gray-900'>
                                                    {
                                                        item.nutritionalInfo
                                                            ?.protein
                                                    }
                                                </div>
                                            </div>
                                            <div className='bg-gray-50 p-3 rounded-md text-center'>
                                                <div className='text-sm text-gray-500'>
                                                    Fat
                                                </div>
                                                <div className='font-bold text-gray-900'>
                                                    {item.nutritionalInfo?.fat}
                                                </div>
                                            </div>
                                            <div className='bg-gray-50 p-3 rounded-md text-center'>
                                                <div className='text-sm text-gray-500'>
                                                    Carbs
                                                </div>
                                                <div className='font-bold text-gray-900'>
                                                    {
                                                        item.nutritionalInfo
                                                            ?.carbs
                                                    }
                                                </div>
                                            </div>
                                            <div className='bg-gray-50 p-3 rounded-md text-center'>
                                                <div className='text-sm text-gray-500'>
                                                    Sodium
                                                </div>
                                                <div className='font-bold text-gray-900'>
                                                    {
                                                        item.nutritionalInfo
                                                            ?.sodium
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div>
                                        <h3 className='font-medium text-gray-900 mb-3'>
                                            Customer Reviews
                                        </h3>

                                        {reviews.length === 0 ? (
                                            <p className='text-gray-500'>
                                                No reviews yet. Be the first to
                                                leave a review!
                                            </p>
                                        ) : (
                                            <div className='space-y-6'>
                                                {reviews.map((review) => (
                                                    <div
                                                        key={review.id}
                                                        className='border-b border-gray-200 pb-6'
                                                    >
                                                        <div className='flex items-center mb-2'>
                                                            <div className='h-10 w-10 rounded-full bg-gray-300 mr-3'></div>
                                                            <div>
                                                                <div className='font-medium text-gray-900'>
                                                                    {
                                                                        review
                                                                            .user
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className='flex items-center'>
                                                                    {[
                                                                        ...Array(
                                                                            5
                                                                        ),
                                                                    ].map(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) => (
                                                                            <FaStar
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className={
                                                                                    i <
                                                                                    review.rating
                                                                                        ? 'text-yellow-400'
                                                                                        : 'text-gray-300'
                                                                                }
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        )
                                                                    )}
                                                                    <span className='ml-2 text-xs text-gray-500'>
                                                                        {new Date(
                                                                            review.createdAt ||
                                                                                review.date
                                                                        ).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className='text-gray-600'>
                                                            {review.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className='mt-6'>
                                            <button className='text-red-600 font-medium hover:text-red-700'>
                                                Write a Review
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedItems.length > 0 && (
                <div className='bg-gray-50 py-12'>
                    <div className='container mx-auto px-4'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-8'>
                            You May Also Like
                        </h2>

                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                            {relatedItems.map(
                                (item) =>
                                    item && (
                                        <div
                                            key={item.id}
                                            className='bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:-translate-y-1 duration-300'
                                        >
                                            <Link href={`/menu/${item.id}`}>
                                                <div className='h-48 bg-gray-200 relative'>
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className='w-full h-full object-cover'
                                                    />
                                                </div>
                                            </Link>
                                            <div className='p-4'>
                                                <Link href={`/menu/${item.id}`}>
                                                    <h3 className='text-lg font-bold text-gray-800 hover:text-red-600 transition-colors duration-200'>
                                                        {item.name}
                                                    </h3>
                                                </Link>
                                                <div className='flex items-center justify-between mt-2'>
                                                    <span className='text-red-600 font-bold'>
                                                        ${item.price.toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            toast.success(
                                                                `${item.name} added to cart!`
                                                            );
                                                        }}
                                                        className='bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-full transition-colors duration-200'
                                                    >
                                                        <FaShoppingCart />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
