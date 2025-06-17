'use client';

import React from 'react';
import { FaUtensils, FaLeaf, FaUsers, FaHeart } from 'react-icons/fa';

const AboutPage = () => {
    return (
        <div className='min-h-screen bg-gray-50 py-12'>
            <div className='container mx-auto px-4'>
                {/* Hero Section */}
                <div className='text-center mb-16'>
                    <h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-6'>
                        О ресторане "Mosaic Sushi"
                    </h1>
                    <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
                        Мы создаем незабываемые кулинарные впечатления с 2010
                        года, сочетая традиции с инновациями.
                    </p>
                </div>

                {/* Our Story */}
                <div className='bg-white rounded-lg shadow-md p-8 mb-12'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-6'>
                        Наша история
                    </h2>
                    <div className='prose max-w-none text-gray-700'>
                        <p className='mb-4'>
                            Ресторан "Mosaic Sushi" был основан в 2010 году с
                            целью создать уютное место, где каждый гость будет
                            чувствовать себя как дома. Начиная с небольшого
                            семейного кафе, мы выросли в популярный ресторан,
                            сохранив при этом наши ценности и философию.
                        </p>
                        <p className='mb-4'>
                            В основе нашей кухни лежат традиционные рецепты,
                            переданные через поколения и дополненные
                            современными кулинарными техниками. Мы тщательно
                            отбираем ингредиенты от местных производителей,
                            чтобы предложить вам блюда высочайшего качества.
                        </p>
                        <p>
                            На протяжении лет мы совершенствовались, расширяли
                            меню и улучшали сервис, но одно оставалось
                            неизменным – наша страсть к созданию вкусных блюд и
                            заботе о каждом госте.
                        </p>
                    </div>
                </div>

                {/* Our Values */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
                    <div className='bg-white rounded-lg shadow-md p-6 text-center'>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <FaUtensils className='text-2xl text-red-600' />
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-2'>
                            Качество
                        </h3>
                        <p className='text-gray-600'>
                            Мы используем только свежие, натуральные ингредиенты
                            для приготовления каждого блюда.
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-md p-6 text-center'>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <FaLeaf className='text-2xl text-red-600' />
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-2'>
                            Устойчивость
                        </h3>
                        <p className='text-gray-600'>
                            Мы заботимся об окружающей среде, используя
                            экологичные материалы и поддерживая местных
                            производителей.
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-md p-6 text-center'>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <FaUsers className='text-2xl text-red-600' />
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-2'>
                            Сообщество
                        </h3>
                        <p className='text-gray-600'>
                            Мы создаем дружественную атмосферу, где каждый гость
                            становится частью нашей большой семьи.
                        </p>
                    </div>

                    <div className='bg-white rounded-lg shadow-md p-6 text-center'>
                        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                            <FaHeart className='text-2xl text-red-600' />
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 mb-2'>
                            Страсть
                        </h3>
                        <p className='text-gray-600'>
                            Мы вкладываем душу в каждое блюдо, стремясь
                            превзойти ожидания наших гостей.
                        </p>
                    </div>
                </div>

                {/* Team */}
                <div className='bg-white rounded-lg shadow-md p-8 mb-12'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-6'>
                        Наша команда
                    </h2>
                    <div className='prose max-w-none text-gray-700'>
                        <p className='mb-4'>
                            В сердце нашего ресторана – талантливые и преданные
                            своему делу профессионалы. Наша команда шеф-поваров
                            обладает многолетним опытом и постоянно
                            совершенствует свои навыки, чтобы удивлять вас
                            новыми кулинарными шедеврами.
                        </p>
                        <p>
                            Наши официанты и менеджеры обеспечивают безупречный
                            сервис, создавая комфортную атмосферу и внимательно
                            относясь к пожеланиям каждого гостя. Вместе мы
                            стремимся сделать каждое посещение "Базы" особенным
                            и запоминающимся.
                        </p>
                    </div>
                </div>

                {/* Visit Us */}
                <div className='text-center'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-6'>
                        Посетите нас
                    </h2>
                    <p className='text-xl text-gray-600 mb-8'>
                        Мы будем рады видеть вас в нашем ресторане и подарить
                        вам незабываемые впечатления от вкусной еды и приятной
                        атмосферы.
                    </p>
                    <a
                        href='/contact'
                        className='inline-block bg-red-600 text-white px-8 py-3 rounded-md font-medium hover:bg-red-700 transition duration-300'
                    >
                        Наши контакты
                    </a>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
