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
                <div className='flex items-start justify-between gap-8 mb-8 md:flex-row flex-col'>
                    {/* Company Info */}
                    <div>
                        <h3 className='text-xl font-bold mb-4'>
                            Ресторан "Mosaic Sushi"
                        </h3>
                        <p className='text-gray-400 mb-4 max-w-80'>
                            Насладитесь лучшей кухней — наши блюда готовятся из
                            свежих ингредиентов по аутентичным рецептам.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-xl font-bold mb-4'>
                            Быстрые ссылки
                        </h3>
                        <ul className='space-y-2 grid grid-cols-2 gap-x-16'>
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

                    {/* Contact Info */}
                    <div>
                        <h3 className='text-xl font-bold mb-4'>
                            Связаться с нами
                        </h3>
                        <ul className='space-y-3'>
                            <li className='flex items-start'>
                                <FaMapMarkerAlt className='text-red-500 mt-1 mr-3 flex-shrink-0' />
                                <span className='text-gray-400'>
                                    г. Ростов-на-Дону, ул. Текучева, 123
                                </span>
                            </li>
                            <li className='flex items-center'>
                                <FaPhoneAlt className='text-red-500 mr-3 flex-shrink-0' />
                                <span className='text-gray-400'>
                                    +7 (918) 123-4567
                                </span>
                            </li>
                            <li className='flex items-center'>
                                <FaEnvelope className='text-red-500 mr-3 flex-shrink-0' />
                                <span className='text-gray-400'>
                                    info@baza.com
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className='pt-6 border-t border-gray-800 text-center text-gray-400 text-sm'>
                    <p>
                        &copy; {currentYear} Ресторан "Mosaic Sushi". Все права
                        защищены.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
