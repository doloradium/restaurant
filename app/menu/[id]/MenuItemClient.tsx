'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaStar,
    FaShoppingCart,
    FaArrowLeft,
    FaPlus,
    FaMinus,
    FaEdit,
    FaTrash,
    FaExclamationTriangle,
    FaStarHalfAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCart } from '@/app/CartProvider';
import { useAuth } from '@/app/AuthProvider';

// Confirmation Modal Component
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}) => {
    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
                <div className='p-6'>
                    <div className='flex items-center mb-4'>
                        <FaExclamationTriangle
                            className='text-yellow-500 mr-3'
                            size={24}
                        />
                        <h3 className='text-xl font-bold text-gray-900'>
                            {title}
                        </h3>
                    </div>

                    <p className='text-gray-600 mb-6'>{message}</p>

                    <div className='flex justify-end space-x-3'>
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
                                onConfirm();
                                onClose();
                            }}
                            className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add this ReviewModal component
const ReviewModal = ({
    isOpen,
    onClose,
    onSubmit,
    itemId,
    initialData = { rating: 0, text: '' },
    isEditing = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { rating: number; text: string }) => void;
    itemId: string;
    initialData?: { rating: number; text: string };
    isEditing?: boolean;
}) => {
    const [rating, setRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const MAX_CHARS = 300;
    const [modalKey, setModalKey] = useState(0); // Add key to force re-render

    // Initialize values when modal opens with fresh data
    useEffect(() => {
        if (isOpen) {
            setRating(initialData.rating);
            setReviewText(initialData.text);
            setModalKey((prev) => prev + 1);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        if (text.length <= MAX_CHARS) {
            setReviewText(text);
        }
    };

    const handleClose = () => {
        onClose();
        // Reset after closing animation would complete
        setTimeout(() => {
            setRating(0);
            setReviewText('');
        }, 300);
    };

    return (
        <div
            key={modalKey}
            className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
        >
            <div className='bg-white rounded-lg shadow-xl max-w-md w-full'>
                <div className='p-6'>
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                        {isEditing ? 'Редактировать отзыв' : 'Написать отзыв'}
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
                            onChange={handleTextChange}
                            className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none'
                            placeholder='Расскажите о вашем опыте с этим блюдом...'
                            maxLength={MAX_CHARS}
                        ></textarea>
                        <div className='text-xs text-gray-500 mt-1 text-right'>
                            {reviewText.length}/{MAX_CHARS} символов
                        </div>
                    </div>

                    <div className='flex justify-end space-x-3 mt-6'>
                        <button
                            type='button'
                            onClick={handleClose}
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
                            {isEditing ? 'Сохранить' : 'Отправить отзыв'}
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
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const { addToCart } = useCart();
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const { user } = useAuth();
    const [currentUserReview, setCurrentUserReview] = useState<any>(null);
    const [reviewToEdit, setReviewToEdit] = useState<any>(null);
    const [reviewToDelete, setReviewToDelete] = useState<any>(null);

    // Check if the current user has already left a review
    useEffect(() => {
        if (user && reviews.length > 0) {
            const userReview = reviews.find(
                (review) => review.user?.id === user.id
            );
            if (userReview) {
                setCurrentUserReview(userReview);
            }
        } else {
            setCurrentUserReview(null);
        }
    }, [user, reviews]);

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

    const handleEditReview = async (data: { rating: number; text: string }) => {
        if (!currentUserReview) return;

        try {
            const response = await fetch(
                `/api/reviews/${currentUserReview.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        rating: data.rating,
                        text: data.text,
                    }),
                }
            );

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(
                    responseData.error || 'Failed to update review'
                );
            }

            toast.success('Отзыв успешно обновлен!');
            setIsEditModalOpen(false);

            // Refresh the page to show the updated review
            router.refresh();
        } catch (error: any) {
            console.error('Error updating review:', error);
            toast.error('Не удалось обновить отзыв.');
        }
    };

    const handleDeleteReview = async () => {
        if (!reviewToDelete) return;

        try {
            const response = await fetch(`/api/reviews/${reviewToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete review');
            }

            toast.success('Отзыв успешно удален!');
            setCurrentUserReview(null);
            setReviewToDelete(null);

            // Refresh the page to update the reviews list
            router.refresh();
        } catch (error: any) {
            console.error('Error deleting review:', error);
            toast.error('Не удалось удалить отзыв.');
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
                            <div className='flex'>
                                {/* Render full stars */}
                                {[...Array(Math.floor(item.rating || 0))].map(
                                    (_, i) => (
                                        <FaStar
                                            key={i}
                                            className='text-yellow-400'
                                        />
                                    )
                                )}

                                {/* Render half star if needed */}
                                {(item.rating || 0) % 1 >= 0.5 && (
                                    <FaStarHalfAlt className='text-yellow-400' />
                                )}

                                {/* Render empty stars to complete 5 stars */}
                                {[
                                    ...Array(
                                        5 -
                                            Math.floor(item.rating || 0) -
                                            ((item.rating || 0) % 1 >= 0.5
                                                ? 1
                                                : 0)
                                    ),
                                ].map((_, i) => (
                                    <FaStar key={i} className='text-gray-300' />
                                ))}

                                <span className='ml-2 text-sm text-gray-600'>
                                    {(item.rating || 0).toFixed(1)} (
                                    {reviews.length} отзывов)
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

                        <div>
                            <div className='border-b border-gray-200'>
                                <h3 className='pb-2 px-4 text-sm font-medium text-red-600 border-b-2 border-red-600'>
                                    Отзывы ({reviews.length})
                                </h3>
                            </div>

                            <div className='py-4'>
                                <div>
                                    <h3 className='font-medium text-gray-900 mb-3'>
                                        Отзывы клиентов
                                    </h3>

                                    {reviews.length === 0 ? (
                                        <p className='text-gray-500'>
                                            Пока нет отзывов. Будьте первым, кто
                                            оставит отзыв!
                                        </p>
                                    ) : (
                                        <div className='space-y-6'>
                                            {reviews.map((review) => (
                                                <div
                                                    key={review.id}
                                                    className='border-b border-gray-200 pb-6'
                                                >
                                                    <div className='flex items-center justify-between mb-2'>
                                                        <div className='flex items-center'>
                                                            <div>
                                                                <div className='font-medium text-gray-900'>
                                                                    {
                                                                        review
                                                                            .user
                                                                            .name
                                                                    }
                                                                </div>
                                                                <div className='flex items-center'>
                                                                    {/* Render full stars */}
                                                                    {[
                                                                        ...Array(
                                                                            Math.floor(
                                                                                review.rating ||
                                                                                    0
                                                                            )
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
                                                                                className='text-yellow-400'
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        )
                                                                    )}

                                                                    {/* Render half star if needed */}
                                                                    {(review.rating ||
                                                                        0) %
                                                                        1 >=
                                                                        0.5 && (
                                                                        <FaStarHalfAlt
                                                                            className='text-yellow-400'
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    )}

                                                                    {/* Render empty stars to complete 5 stars */}
                                                                    {[
                                                                        ...Array(
                                                                            5 -
                                                                                Math.floor(
                                                                                    review.rating ||
                                                                                        0
                                                                                ) -
                                                                                ((review.rating ||
                                                                                    0) %
                                                                                    1 >=
                                                                                0.5
                                                                                    ? 1
                                                                                    : 0)
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
                                                                                className='text-gray-300'
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        )
                                                                    )}
                                                                    <span className='ml-2 text-xs text-gray-500'>
                                                                        {(() => {
                                                                            const timestamp =
                                                                                review.createdAt ||
                                                                                review.date;
                                                                            // Convert timestamp to milliseconds if it's in seconds
                                                                            const dateObj =
                                                                                new Date(
                                                                                    typeof timestamp ===
                                                                                        'number' &&
                                                                                    timestamp <
                                                                                        10000000000
                                                                                        ? timestamp *
                                                                                          1000 // Convert seconds to milliseconds
                                                                                        : timestamp
                                                                                );
                                                                            return dateObj.toLocaleDateString(
                                                                                'ru-RU',
                                                                                {
                                                                                    year: 'numeric',
                                                                                    month: '2-digit',
                                                                                    day: '2-digit',
                                                                                }
                                                                            );
                                                                        })()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {user &&
                                                            user.id ===
                                                                review.user
                                                                    .id && (
                                                                <div className='flex space-x-2'>
                                                                    <button
                                                                        onClick={() => {
                                                                            setReviewToEdit(
                                                                                review
                                                                            );
                                                                            setIsEditModalOpen(
                                                                                true
                                                                            );
                                                                        }}
                                                                        className='text-gray-500 hover:text-blue-600'
                                                                        title='Редактировать отзыв'
                                                                    >
                                                                        <FaEdit />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setReviewToDelete(
                                                                                review
                                                                            );
                                                                            setIsDeleteModalOpen(
                                                                                true
                                                                            );
                                                                        }}
                                                                        className='text-gray-500 hover:text-red-600'
                                                                        title='Удалить отзыв'
                                                                    >
                                                                        <FaTrash />
                                                                    </button>
                                                                </div>
                                                            )}
                                                    </div>
                                                    <p className='text-gray-600'>
                                                        {review.text}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className='mt-6'>
                                        {user ? (
                                            !currentUserReview ? (
                                                <button
                                                    className='text-red-600 font-medium hover:text-red-700'
                                                    onClick={() =>
                                                        setIsReviewModalOpen(
                                                            true
                                                        )
                                                    }
                                                >
                                                    Написать отзыв
                                                </button>
                                            ) : null
                                        ) : (
                                            <Link
                                                href='/login'
                                                className='text-red-600 font-medium hover:text-red-700'
                                            >
                                                Войдите, чтобы написать отзыв
                                            </Link>
                                        )}
                                    </div>
                                </div>
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

            <ReviewModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditReview}
                itemId={item.id}
                initialData={
                    reviewToEdit
                        ? {
                              rating: reviewToEdit.rating,
                              text: reviewToEdit.text,
                          }
                        : { rating: 0, text: '' }
                }
                isEditing={true}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteReview}
                title='Удаление отзыва'
                message='Вы уверены, что хотите удалить этот отзыв? Это действие нельзя будет отменить.'
            />
        </div>
    );
}
