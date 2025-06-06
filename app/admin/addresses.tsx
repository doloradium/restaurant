'use client';

import {
    List,
    Datagrid,
    TextField,
    Edit,
    SimpleForm,
    TextInput,
    Create,
    BulkDeleteButton,
    useRedirect,
    useNotify,
    ReferenceField,
    ReferenceInput,
    SaveButton,
    Toolbar,
    ToolbarProps,
    NumberInput,
    SelectInput,
} from 'react-admin';
import NoSortDatagrid from './components/NoSortDatagrid';

// Simple edit toolbar
const EditToolbar = (props: ToolbarProps) => (
    <Toolbar {...props}>
        <SaveButton label='Сохранить' />
    </Toolbar>
);

export const AddressList = () => (
    <List>
        <NoSortDatagrid
            rowClick='edit'
            bulkActionButtons={<BulkDeleteButton />}
        >
            <TextField source='id' label='ID' />
            <ReferenceField
                source='userId'
                reference='users'
                label='Пользователь'
            >
                <TextField source='name' />
            </ReferenceField>
            <TextField source='city' label='Город' />
            <TextField source='street' label='Улица' />
            <TextField source='houseNumber' label='Дом' />
            <TextField source='apartment' label='Квартира' />
            <TextField source='entrance' label='Подъезд' />
            <TextField source='floor' label='Этаж' />
            <TextField source='intercom' label='Домофон' />
        </NoSortDatagrid>
    </List>
);

export const AddressEdit = () => {
    return (
        <Edit>
            <SimpleForm toolbar={<EditToolbar />}>
                <ReferenceInput
                    source='userId'
                    reference='users'
                    label='Пользователь'
                >
                    <SelectInput label='Пользователь' optionText='name' />
                </ReferenceInput>
                <TextInput source='city' label='Город' fullWidth required />
                <TextInput source='street' label='Улица' fullWidth required />
                <TextInput
                    source='houseNumber'
                    label='Дом'
                    fullWidth
                    required
                />
                <TextInput source='apartment' label='Квартира' fullWidth />
                <TextInput source='entrance' label='Подъезд' fullWidth />
                <TextInput source='floor' label='Этаж' fullWidth />
                <TextInput source='intercom' label='Домофон' fullWidth />
            </SimpleForm>
        </Edit>
    );
};

export const AddressCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Адрес успешно создан');
        redirect('list', 'addresses');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm toolbar={<EditToolbar />}>
                <ReferenceInput
                    source='userId'
                    reference='users'
                    label='Пользователь'
                    required
                >
                    <SelectInput label='Пользователь' optionText='name' />
                </ReferenceInput>
                <TextInput source='city' label='Город' fullWidth required />
                <TextInput source='street' label='Улица' fullWidth required />
                <TextInput
                    source='houseNumber'
                    label='Дом'
                    fullWidth
                    required
                />
                <TextInput source='apartment' label='Квартира' fullWidth />
                <TextInput source='entrance' label='Подъезд' fullWidth />
                <TextInput source='floor' label='Этаж' fullWidth />
                <TextInput source='intercom' label='Домофон' fullWidth />
            </SimpleForm>
        </Create>
    );
};
