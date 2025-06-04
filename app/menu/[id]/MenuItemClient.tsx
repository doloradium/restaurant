'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaStar,
    FaShoppingCart,
    FaArrowLeft,
    FaPlus,
    FaMinus,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '@/app/CartProvider';

// Add this ReviewModal component
const ReviewModal = ({
    isOpen,
    onClose,
    onSubmit,
    itemId,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { rating: number; text: string }) => void;
    itemId: string;
}) => {
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
                <div className='p-6'>
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                        Написать отзыв
                    </h3>

                    <div className='mb-4'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Оценка
                        </label>
                        <div className='flex items-center'>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type='button'
                                    onClick={() => setRating(star)}
                                    className='p-1'
                                >
                                    <FaStar
                                        size={24}
                                        className={
                                            star <= rating
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        }
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='mb-4'>
                        <label
                            htmlFor='review-text'
                            className='block text-sm font-medium text-gray-700 mb-2'
                        >
                            Ваш отзыв
                        </label>
                        <textarea
                            id='review-text'
                            rows={4}
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500'
                            placeholder='Расскажите о вашем опыте с этим блюдом...'
                        ></textarea>
                    </div>

                    <div className='flex justify-end space-x-3 mt-6'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                        >
                            Отмена
                        </button>
                        <button
                            type='button'
                            onClick={() => {
                                if (reviewText.trim() === '') {
                                    toast.error(
                                        'Пожалуйста, добавьте текст отзыва'
                                    );
                                    return;
                                }
                                onSubmit({ rating, text: reviewText });
                            }}
                            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'
                        >
                            Отправить отзыв
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const { addToCart } = useCart();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    if (!item) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='text-center'>
                    <h2 className='text-2xl font-bold text-gray-700 mb-4'>
                        Товар не найден
                    </h2>
                    <p className='text-gray-500 mb-6'>
                        Товар, который вы ищете, не существует или был удален.
                    </p>
                    <Link
                        href='/menu'
                        className='bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition duration-200'
                    >
                        Вернуться в меню
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
        addToCart({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            quantity: quantity,
            image:
                item.images && item.images.length > 0
                    ? item.images[0].imageUrl
                    : undefined,
            categoryId: item.categoryId || item.category?.id,
        });
    };

    const handleReviewSubmit = async (data: {
        rating: number;
        text: string;
    }) => {
        try {
            const response = await fetch(`/api/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    itemId: item.id,
                    rating: data.rating,
                    text: data.text,
                }),
            });

            const responseData = await response.json();
            console.log('Review submission response:', responseData);

            if (!response.ok) {
                throw new Error(
                    responseData.error || 'Failed to submit review'
                );
            }

            toast.success('Отзыв успешно добавлен!');
            setIsReviewModalOpen(false);

            // Refresh the page to show the new review
            router.refresh();
        } catch (error: any) {
            console.error('Error submitting review:', error);

            // Show a more descriptive error message
            let errorMessage = 'Не удалось отправить отзыв.';

            if (
                error.message &&
                error.message.includes('Необходимо авторизоваться')
            ) {
                errorMessage =
                    'Для отправки отзыва необходимо войти в систему.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        }
    };

    return (
        <div className='bg-white'>
            <div className='bg-gray-100 py-3'>
                <div className='container mx-auto px-4'>
                    <div className='flex items-center text-sm text-gray-600'>
                        <Link href='/' className='hover:text-red-600'>
                            Главная
                        </Link>
                        <span className='mx-2'>/</span>
                        <Link href='/menu' className='hover:text-red-600'>
                            Меню
                        </Link>
                        <span className='mx-2'>/</span>
                        <Link
                            href={`/menu?category=${
                                item.categoryId ||
                                (item.category && item.category.id) ||
                                ''
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

            <div className='container mx-auto px-4 py-8'>
                <button
                    onClick={() => router.back()}
                    className='flex items-center text-gray-600 hover:text-red-600 mb-6'
                >
                    <FaArrowLeft className='mr-2' /> Назад к меню
                </button>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                    <div>
                        <div>
                            <div className='mb-4 aspect-square bg-gray-100 rounded-lg overflow-hidden relative'>
                                {item.images && item.images.length > 0 ? (
                                    <img
                                        src={
                                            item.images[activeImageIndex]
                                                ?.imageUrl ||
                                            item.images[0].imageUrl
                                        }
                                        alt={item.name}
                                        className='w-full h-full object-cover'
                                    />
                                ) : (
                                    <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                                        <span className='text-gray-500'>
                                            Нет изображения
                                        </span>
                                    </div>
                                )}
                            </div>

                            {item.images && item.images.length > 0 && (
                                <div className='grid grid-cols-4 gap-4'>
                                    {item.images.map(
                                        (
                                            image: {
                                                id: number;
                                                imageUrl: string;
                                            },
                                            index: number
                                        ) => (
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
                                                    src={image.imageUrl}
                                                    alt={`${
                                                        item.name
                                                    } - Image ${index + 1}`}
                                                    className='w-full h-full object-cover'
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

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
                                            i < Math.floor(item.rating || 5)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                        } ${
                                            i ===
                                                Math.floor(item.rating || 5) &&
                                            (item.rating || 5) % 1 > 0
                                                ? 'text-yellow-200'
                                                : ''
                                        }`}
                                    />
                                ))}
                                <span className='ml-2 text-gray-600'>
                                    {item.rating || 5} (
                                    {item.reviews?.length || 0} отзывов)
                                </span>
                            </div>

                            <div className='text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700'>
                                {item.category?.name || item.category}
                            </div>
                        </div>

                        <div className='text-2xl font-bold text-red-600 mb-4'>
                            ₽{item.price.toFixed(2)}
                        </div>

                        <p className='text-gray-600 mb-6'>{item.description}</p>

                        <div className='mb-6 flex flex-wrap gap-3'>
                            {item.isVegetarian && (
                                <span className='bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full'>
                                    Вегетарианское
                                </span>
                            )}
                            {item.isGlutenFree && (
                                <span className='bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full'>
                                    Без глютена
                                </span>
                            )}
                            {item.isSpicy && (
                                <span className='bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full'>
                                    Острое
                                </span>
                            )}
                        </div>

                        <div className='mb-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Количество
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

                        <div className='mb-8'>
                            <button
                                onClick={handleAddToCart}
                                className='w-full py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition duration-200 flex items-center justify-center'
                            >
                                <FaShoppingCart className='mr-2' />
                                Добавить в корзину - ₽
                                {(item.price * quantity).toFixed(2)}
                            </button>
                        </div>

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
                                    Описание
                                </button>
                                <button
                                    className={`pb-2 px-4 text-sm font-medium ${
                                        activeTab === 'reviews'
                                            ? 'text-red-600 border-b-2 border-red-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    onClick={() => setActiveTab('reviews')}
                                >
                                    Отзывы ({reviews.length})
                                </button>
                            </div>

                            <div className='py-4'>
                                {activeTab === 'description' && (
                                    <div className='prose max-w-none text-gray-600'>
                                        <p>{item.description}</p>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div>
                                        <h3 className='font-medium text-gray-900 mb-3'>
                                            Отзывы клиентов
                                        </h3>

                                        {reviews.length === 0 ? (
                                            <p className='text-gray-500'>
                                                Пока нет отзывов. Будьте первым,
                                                кто оставит отзыв!
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
                                                                                    (review.rating ||
                                                                                        5)
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
                                            <button
                                                className='text-red-600 font-medium hover:text-red-700'
                                                onClick={() =>
                                                    setIsReviewModalOpen(true)
                                                }
                                            >
                                                Написать отзыв
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {relatedItems.length > 0 && (
                <div className='bg-gray-50 py-12'>
                    <div className='container mx-auto px-4'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-8'>
                            Вам также может понравиться
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
                                                    {item.images &&
                                                    item.images.length > 0 ? (
                                                        <img
                                                            src={
                                                                item.images[0]
                                                                    .imageUrl
                                                            }
                                                            alt={item.name}
                                                            className='w-full h-full object-cover'
                                                        />
                                                    ) : (
                                                        <div className='h-full w-full bg-gray-200 flex items-center justify-center'>
                                                            <span className='text-sm text-gray-500'>
                                                                Нет изображения
                                                            </span>
                                                        </div>
                                                    )}
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
                                                        ₽{item.price.toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            toast.success(
                                                                `${item.name} добавлен в корзину!`
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

            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                onSubmit={handleReviewSubmit}
                itemId={item.id}
            />
        </div>
    );
}
