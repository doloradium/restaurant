'use client';

import Link from 'next/link';
import { FaStar, FaArrowRight } from 'react-icons/fa';
import MenuItem from '@/components/menu/MenuItem';
import ReviewCarousel from '@/components/ReviewCarousel';

export default function HomeClient({
    categories,
    reviews,
    popularDishes,
}: {
    categories: any[];
    reviews: any[];
    popularDishes: any[];
}) {
    return (
        <div>
            {/* Hero Section */}
            <section className='relative h-[70vh] flex items-center'>
                <div className='absolute inset-0 z-0'>
                    <div className='relative h-full w-full'>
                        <div className='absolute inset-0 bg-black/50 z-10'></div>
                        <div className='h-full w-full hero-bg'></div>
                    </div>
                </div>
                <div className='container mx-auto px-4 relative z-20'>
                    <div className='max-w-2xl'>
                        <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4'>
                            Попробуйте аутентичную японскую кухню
                        </h1>
                        <p className='text-xl text-gray-200 mb-8'>
                            Насладитесь мастерством наших шеф-поваров и самыми
                            свежими ингредиентами
                        </p>
                        <div className='flex flex-wrap gap-4'>
                            <Link
                                href='/menu'
                                className='bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-md font-medium transition duration-200 inline-flex items-center'
                            >
                                Смотреть меню <FaArrowRight className='ml-2' />
                            </Link>
                            <Link
                                href='/about'
                                className='bg-transparent hover:bg-white/10 text-white border border-white px-8 py-3 rounded-md font-medium transition duration-200'
                            >
                                О нас
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className='py-16 bg-gray-50'>
                <div className='container mx-auto px-4'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold mb-4'>
                            Категории меню
                        </h2>
                        <p className='text-gray-600 max-w-2xl mx-auto'>
                            Ознакомьтесь с разнообразием японской кухни: от
                            традиционных суши до современных фьюжн-блюд
                        </p>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/menu?category=${category.id}`}
                                className='group bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2'
                            >
                                <div className='p-4 text-center'>
                                    <h3 className='text-xl font-bold text-gray-800 group-hover:text-red-600 transition-colors duration-200'>
                                        {category.name}
                                    </h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className='py-16'>
                <div className='container mx-auto px-4'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold mb-4'>
                            Популярные блюда
                        </h2>
                        <p className='text-gray-600 max-w-2xl mx-auto'>
                            Откройте для себя фирменные блюда шефа и любимые
                            позиции гостей
                        </p>
                    </div>
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                        {popularDishes.map((product) => (
                            <MenuItem
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                description={product.description || ''}
                                price={product.price || 0}
                                images={product.images}
                                categoryId={product.categoryId}
                                categoryName={product.category?.name}
                            />
                        ))}
                    </div>
                    <div className='mt-10 text-center'>
                        <Link
                            href='/menu'
                            className='inline-flex items-center text-red-600 hover:text-red-700 font-medium'
                        >
                            Смотреть всё меню <FaArrowRight className='ml-2' />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className='py-16 bg-gray-900 text-white'>
                <div className='container mx-auto px-4'>
                    <div className='text-center mb-12'>
                        <h2 className='text-3xl font-bold mb-4'>
                            Отзывы наших клиентов
                        </h2>
                        <p className='text-gray-400 max-w-2xl mx-auto'>
                            Не верьте нам на слово — послушайте, что говорят
                            наши довольные гости
                        </p>
                    </div>
                    <ReviewCarousel reviews={reviews} />
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-16 bg-red-600 text-white'>
                <div className='container mx-auto px-4 text-center'>
                    <h2 className='text-3xl font-bold mb-6'>
                        Готовы сделать заказ?
                    </h2>
                    <p className='text-xl mb-8 max-w-2xl mx-auto'>
                        Попробуйте настоящий вкус Японии — с доставкой к вам
                        домой
                    </p>
                    <Link
                        href='/menu'
                        className='bg-white text-red-600 hover:bg-gray-100 px-8 py-3 rounded-md font-medium transition duration-200 inline-flex items-center'
                    >
                        Заказать <FaArrowRight className='ml-2' />
                    </Link>
                </div>
            </section>
        </div>
    );
}
