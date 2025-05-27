'use client';

import { Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { ItemList, ItemEdit, ItemCreate } from './items';
import { CategoryList, CategoryEdit, CategoryCreate } from './categories';
import { UserList, UserEdit, UserCreate } from './users';
import { ReviewList, ReviewEdit, ReviewCreate } from './reviews';
import { OrderList, OrderEdit, OrderCreate } from './orders';
import dynamic from 'next/dynamic';
import CustomAdmin from './CustomAdmin';

// Import Material UI Icons
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

// Dynamically import the CustomAdmin component with no SSR
const AdminComponent = dynamic(() => Promise.resolve(CustomAdmin), {
    ssr: false,
});

export default function AdminLayout() {
    return (
        <AdminComponent dataProvider={dataProvider}>
            <Resource
                name='items'
                list={ItemList}
                edit={ItemEdit}
                create={ItemCreate}
                icon={RestaurantMenuIcon}
                options={{ label: 'Menu Items' }}
            />
            <Resource
                name='categories'
                list={CategoryList}
                edit={CategoryEdit}
                create={CategoryCreate}
                icon={CategoryIcon}
            />
            <Resource
                name='users'
                list={UserList}
                edit={UserEdit}
                create={UserCreate}
                icon={PeopleIcon}
            />
            <Resource
                name='reviews'
                list={ReviewList}
                edit={ReviewEdit}
                create={ReviewCreate}
                icon={RateReviewIcon}
            />
            <Resource
                name='orders'
                list={OrderList}
                edit={OrderEdit}
                create={OrderCreate}
                icon={ShoppingCartIcon}
            />
        </AdminComponent>
    );
}
