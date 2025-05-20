'use client';

import { Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { ItemList, ItemEdit, ItemCreate } from './items';
import { CategoryList, CategoryEdit, CategoryCreate } from './categories';
import { UserList, UserEdit, UserCreate } from './users';
import { ReviewList, ReviewEdit } from './reviews';
import dynamic from 'next/dynamic';
import CustomAdmin from './CustomAdmin';

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
            />
            <Resource
                name='categories'
                list={CategoryList}
                edit={CategoryEdit}
                create={CategoryCreate}
            />
            <Resource
                name='users'
                list={UserList}
                edit={UserEdit}
                create={UserCreate}
            />
            <Resource name='reviews' list={ReviewList} edit={ReviewEdit} />
        </AdminComponent>
    );
}
