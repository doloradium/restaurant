'use client';

import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

const ContactPage = () => {
    return (
        <div className='min-h-screen bg-gray-50 py-12'>
            <div className='container mx-auto px-4'>
                <h1 className='text-4xl md:text-5xl font-bold text-gray-900 text-center mb-12'>
                    Контакты
                </h1>

                <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-16'>
                    <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                        Связаться с нами
                    </h2>

                    <div className='space-y-6'>
                        <div className='flex items-start'>
                            <div className='flex-shrink-0 mt-1'>
                                <FaMapMarkerAlt className='text-red-600 text-xl' />
                            </div>
                            <div className='ml-4'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    Адрес
                                </h3>
                                <p className='text-gray-600 mt-1'>
                                    ул. Ленина 42, Москва, Россия, 127000
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start'>
                            <div className='flex-shrink-0 mt-1'>
                                <FaPhone className='text-red-600 text-xl' />
                            </div>
                            <div className='ml-4'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    Телефон
                                </h3>
                                <p className='text-gray-600 mt-1'>
                                    +7 (495) 123-45-67
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start'>
                            <div className='flex-shrink-0 mt-1'>
                                <FaEnvelope className='text-red-600 text-xl' />
                            </div>
                            <div className='ml-4'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    Email
                                </h3>
                                <p className='text-gray-600 mt-1'>
                                    info@restoran-baza.ru
                                </p>
                            </div>
                        </div>

                        <div className='flex items-start'>
                            <div className='flex-shrink-0 mt-1'>
                                <FaClock className='text-red-600 text-xl' />
                            </div>
                            <div className='ml-4'>
                                <h3 className='text-lg font-medium text-gray-900'>
                                    Часы работы
                                </h3>
                                <div className='text-gray-600 mt-1'>
                                    <p>Понедельник - Пятница: 10:00 - 22:00</p>
                                    <p>Суббота - Воскресенье: 11:00 - 23:00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map */}
                <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-md p-4 mb-12'>
                    <div className='w-full h-96 bg-gray-200 rounded-lg'>
                        <iframe
                            src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.0742768245843!2d37.6173!3d55.7558!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDQ1JzIwLjkiTiAzN8KwMzcnMDIuMyJF!5e0!3m2!1sru!2sru!4v1630000000000!5m2!1sru!2sru'
                            width='100%'
                            height='100%'
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading='lazy'
                            className='rounded-lg'
                            title='Restaurant location'
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
