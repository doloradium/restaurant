'use client';

import { Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { ItemList, ItemEdit, ItemCreate } from './items';
import { CategoryList, CategoryEdit, CategoryCreate } from './categories';
import { UserList, UserEdit, UserCreate } from './users';
import { ReviewList, ReviewEdit, ReviewCreate } from './reviews';
import { OrderList, OrderEdit, OrderCreate } from './orders';
import { AddressList, AddressEdit, AddressCreate } from './addresses';
import dynamic from 'next/dynamic';
import CustomAdmin from './CustomAdmin';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Import Material UI Icons
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';

// Import Delivery component
import DeliveryManagement from './delivery';

// Dynamically import the CustomAdmin component with no SSR
const AdminComponent = dynamic(() => Promise.resolve(CustomAdmin), {
    ssr: false,
});

export default function AdminLayout() {
    const pathname = usePathname();

    return (
        <AdminComponent dataProvider={dataProvider}>
            <Resource
                name='items'
                list={ItemList}
                edit={ItemEdit}
                create={ItemCreate}
                icon={RestaurantMenuIcon}
                options={{ label: 'Пункты меню' }}
            />
            <Resource
                name='categories'
                list={CategoryList}
                edit={CategoryEdit}
                create={CategoryCreate}
                icon={CategoryIcon}
                options={{ label: 'Категории' }}
            />
            <Resource
                name='users'
                list={UserList}
                edit={UserEdit}
                create={UserCreate}
                icon={PeopleIcon}
                options={{ label: 'Пользователи' }}
            />
            <Resource
                name='addresses'
                list={AddressList}
                edit={AddressEdit}
                create={AddressCreate}
                icon={HomeIcon}
                options={{ label: 'Адреса' }}
            />
            <Resource
                name='reviews'
                list={ReviewList}
                edit={ReviewEdit}
                create={ReviewCreate}
                icon={RateReviewIcon}
                options={{ label: 'Отзывы' }}
            />
            <Resource
                name='orders'
                list={OrderList}
                edit={OrderEdit}
                create={OrderCreate}
                icon={ShoppingCartIcon}
                options={{ label: 'Заказы' }}
            />
            <Resource
                name='delivery'
                list={DeliveryManagement}
                icon={LocalShippingIcon}
                options={{ label: 'Управление доставкой' }}
            />
            <nav className='mb-6 bg-white shadow'>
                <div className='container mx-auto px-6 py-3'>
                    <div className='flex items-center justify-between'>
                        <h1 className='text-xl font-bold'>
                            Панель администратора
                        </h1>
                        <div className='flex space-x-4'>
                            <Link
                                className={`${
                                    pathname === '/admin'
                                        ? 'text-red-500'
                                        : 'text-gray-800'
                                }`}
                                href='/admin'
                            >
                                Главная
                            </Link>
                            <Link
                                className={`${
                                    pathname === '/admin/orders'
                                        ? 'text-red-500'
                                        : 'text-gray-800'
                                }`}
                                href='/admin/orders'
                            >
                                Заказы
                            </Link>
                            <Link
                                className={`${
                                    pathname === '/admin/users'
                                        ? 'text-red-500'
                                        : 'text-gray-800'
                                }`}
                                href='/admin/users'
                            >
                                Пользователи
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </AdminComponent>
    );
}
