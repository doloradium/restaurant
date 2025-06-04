'use client';

import { FaStar, FaUtensils } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

type Review = {
    id: number;
    text: string;
    rating?: number;
    user?: {
        name?: string;
        surname?: string;
    };
    name?: string;
    itemId?: number;
    userId?: number;
    dishName?: string;
    item?: {
        name: string;
    };
};

type ReviewCarouselProps = {
    reviews: Review[];
};

export default function ReviewCarousel({ reviews }: ReviewCarouselProps) {
    // If there are no reviews, don't render the component
    if (!reviews || reviews.length === 0) {
        return null;
    }

    return (
        <div className='relative w-full py-8'>
            <Swiper
                modules={[Pagination, Navigation, Autoplay]}
                spaceBetween={30}
                slidesPerView={1}
                breakpoints={{
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                    },
                    1024: {
                        slidesPerView: 3,
                        spaceBetween: 30,
                    },
                }}
                pagination={{
                    clickable: true,
                    dynamicBullets: true,
                }}
                navigation={true}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                loop={true}
                className='mySwiper'
            >
                {reviews.map((review) => (
                    <SwiperSlide key={review.id} className='pb-12'>
                        <div className='bg-gray-800 p-6 rounded-lg h-full flex flex-col animate-fadeIn'>
                            <div className='flex mb-4'>
                                {[...Array(5)].map((_, i) => (
                                    <FaStar
                                        key={i}
                                        className={
                                            i < (review.rating ?? 5)
                                                ? 'text-yellow-400'
                                                : 'text-gray-600'
                                        }
                                    />
                                ))}
                            </div>
                            <p className='text-gray-300 mb-4 italic flex-grow'>
                                "{review.text}"
                            </p>

                            {/* Display dish name if available */}
                            {(review.dishName || review.item?.name) && (
                                <p className='text-gray-400 mb-2 flex items-center'>
                                    <FaUtensils className='mr-2' />
                                    {review.dishName || review.item?.name}
                                </p>
                            )}

                            <p className='font-bold'>
                                {review.name ||
                                    (review.user?.name && review.user?.surname
                                        ? `${review.user.name} ${review.user.surname}`
                                        : review.user?.name) ||
                                    'Аноним'}
                            </p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            <style jsx global>{`
                .swiper {
                    width: 100%;
                    height: 100%;
                    padding-bottom: 50px;
                }

                .swiper-slide {
                    height: auto;
                    transition: transform 0.3s ease;
                }

                .swiper-slide-active {
                    transform: scale(1.02);
                }

                .swiper-pagination {
                    bottom: 0 !important;
                }

                .swiper-pagination-bullet {
                    background: #9ca3af;
                }

                .swiper-pagination-bullet-active {
                    background: #ffffff;
                }

                .swiper-button-next,
                .swiper-button-prev {
                    color: #ffffff !important;
                    background: rgba(55, 65, 81, 0.7);
                    width: 35px !important;
                    height: 35px !important;
                    border-radius: 50%;
                    transition: background 0.3s ease;
                }

                .swiper-button-next:hover,
                .swiper-button-prev:hover {
                    background: rgba(75, 85, 99, 0.9);
                }

                .swiper-button-next:after,
                .swiper-button-prev:after {
                    font-size: 18px !important;
                }

                @keyframes fadeIn {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
