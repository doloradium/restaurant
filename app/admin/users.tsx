'use client';

import {
    List,
    Datagrid,
    TextField,
    EmailField,
    Edit,
    SimpleForm,
    TextInput,
    Create,
    SelectInput,
    NumberInput,
} from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid rowClick='edit'>
            <TextField source='id' />
            <TextField source='name' />
            <TextField source='surname' />
            <EmailField source='email' />
            <TextField source='phoneNumber' />
            <TextField source='role' />
            <TextField source='rating' />
        </Datagrid>
    </List>
);

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source='name' />
            <TextInput source='surname' />
            <TextInput source='email' />
            <TextInput source='phoneNumber' />
            <TextInput source='street' />
            <TextInput source='house' />
            <TextInput source='apartment' />
            <SelectInput
                source='role'
                choices={[
                    { id: 'USER', name: 'User' },
                    { id: 'ADMIN', name: 'Admin' },
                    { id: 'COOK', name: 'Cook' },
                    { id: 'COURIER', name: 'Courier' },
                ]}
            />
            <NumberInput source='rating' />
        </SimpleForm>
    </Edit>
);

export const UserCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source='name' />
            <TextInput source='surname' />
            <TextInput source='email' />
            <TextInput source='phoneNumber' />
            <TextInput source='street' />
            <TextInput source='house' />
            <TextInput source='apartment' />
            <TextInput source='passwordHash' />
            <SelectInput
                source='role'
                choices={[
                    { id: 'USER', name: 'User' },
                    { id: 'ADMIN', name: 'Admin' },
                    { id: 'COOK', name: 'Cook' },
                    { id: 'COURIER', name: 'Courier' },
                ]}
            />
            <NumberInput source='rating' />
        </SimpleForm>
    </Create>
);
