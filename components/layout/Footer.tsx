import Link from 'next/link';
import {
    FaFacebook,
    FaInstagram,
    FaTwitter,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaEnvelope,
} from 'react-icons/fa';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className='bg-gray-900 text-white pt-12 pb-6'>
            <div className='container mx-auto px-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
                    {/* Company Info */}
                    <div>
                        <h3 className='text-xl font-bold mb-4'>
                            Ресторан "База"
                        </h3>
                        <p className='text-gray-400 mb-4'>
                            Насладитесь лучшей японской кухней — наши суши
                            готовятся из свежих ингредиентов по аутентичным
                            рецептам.
                        </p>
                        <div className='flex space-x-4'>
                            <a
                                href='https://facebook.com'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-gray-400 hover:text-white transition duration-200'
                            >
                                <FaFacebook size={20} />
                            </a>
                            <a
                                href='https://instagram.com'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-gray-400 hover:text-white transition duration-200'
                            >
                                <FaInstagram size={20} />
                            </a>
                            <a
                                href='https://twitter.com'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-gray-400 hover:text-white transition duration-200'
                            >
                                <FaTwitter size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-xl font-bold mb-4'>
                            Быстрые ссылки
                        </h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link
                                    href='/'
                                    className='text-gray-400 hover:text-white transition duration-200'
                                >
                                    Главная
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/menu'
                                    className='text-gray-400 hover:text-white transition duration-200'
                                >
                                    Меню
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/about'
                                    className='text-gray-400 hover:text-white transition duration-200'
                                >
                                    О нас
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/contact'
                                    className='text-gray-400 hover:text-white transition duration-200'
                                >
                                    Контакты
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className='text-xl font-bold mb-4'>
                            Правовая информация
                        </h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link
                                    href='/terms'
                                    className='text-gray-400 hover:text-white transition duration-200'
                                >
                                    Условия использования
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/privacy'
                                    className='text-gray-400 hover:text-white transition duration-200'
                                >
                                    Политика конфиденциальности
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/refund'
                                    className='text-gray-400 hover:text-white transition duration-200'
                                >
                                    Политика возврата
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className='text-xl font-bold mb-4'>
                            Связаться с нами
                        </h3>
                        <ul className='space-y-3'>
                            <li className='flex items-start'>
                                <FaMapMarkerAlt className='text-red-500 mt-1 mr-3 flex-shrink-0' />
                                <span className='text-gray-400'>
                                    ул. Суши, 123, Фудвиль, FD 12345
                                </span>
                            </li>
                            <li className='flex items-center'>
                                <FaPhoneAlt className='text-red-500 mr-3 flex-shrink-0' />
                                <span className='text-gray-400'>
                                    +1 (555) 123-4567
                                </span>
                            </li>
                            <li className='flex items-center'>
                                <FaEnvelope className='text-red-500 mr-3 flex-shrink-0' />
                                <span className='text-gray-400'>
                                    info@mosaicsushi.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className='pt-6 border-t border-gray-800 text-center text-gray-400 text-sm'>
                    <p>
                        &copy; {currentYear} Ресторан "База". Все права
                        защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
