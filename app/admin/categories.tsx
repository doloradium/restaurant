'use client';

import {
    List,
    Datagrid,
    TextField,
    Edit,
    SimpleForm,
    TextInput,
    Create,
} from 'react-admin';

export const CategoryList = () => (
    <List>
        <Datagrid rowClick='edit'>
            <TextField source='id' />
            <TextField source='name' />
        </Datagrid>
    </List>
);

export const CategoryEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source='name' />
        </SimpleForm>
    </Edit>
);

export const CategoryCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source='name' />
        </SimpleForm>
    </Create>
);
