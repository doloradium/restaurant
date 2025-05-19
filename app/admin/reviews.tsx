'use client';

import {
    List,
    Datagrid,
    TextField,
    DateField,
    Edit,
    SimpleForm,
    TextInput,
    ReferenceInput,
    SelectInput,
} from 'react-admin';

export const ReviewList = () => (
    <List>
        <Datagrid rowClick='edit'>
            <TextField source='id' />
            <TextField source='item.name' label='Item' />
            <TextField source='user.name' label='User Name' />
            <TextField source='user.surname' label='User Surname' />
            <DateField source='createdAt' />
            <TextField source='text' />
        </Datagrid>
    </List>
);

export const ReviewEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceInput source='itemId' reference='items'>
                <SelectInput optionText='name' />
            </ReferenceInput>
            <ReferenceInput source='userId' reference='users'>
                <SelectInput optionText='email' />
            </ReferenceInput>
            <TextInput source='text' multiline />
        </SimpleForm>
    </Edit>
);
