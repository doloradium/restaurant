'use client';

import {
    List,
    Datagrid,
    TextField,
    NumberField,
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    Create,
} from 'react-admin';

export const ItemList = () => (
    <List>
        <Datagrid rowClick='edit'>
            <TextField source='id' />
            <TextField source='name' />
            <TextField source='description' />
            <NumberField source='price' />
            <TextField source='categoryId' />
        </Datagrid>
    </List>
);

export const ItemEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source='name' />
            <TextInput source='description' multiline />
            <NumberInput source='price' />
            <ReferenceInput source='categoryId' reference='categories'>
                <SelectInput optionText='name' />
            </ReferenceInput>
        </SimpleForm>
    </Edit>
);

export const ItemCreate = () => (
    <Create>
        <SimpleForm>
            <TextInput source='name' />
            <TextInput source='description' multiline />
            <NumberInput source='price' />
            <ReferenceInput source='categoryId' reference='categories'>
                <SelectInput optionText='name' />
            </ReferenceInput>
        </SimpleForm>
    </Create>
);
