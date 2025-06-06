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
    BulkDeleteButton,
    useRedirect,
    useNotify,
    FunctionField,
    ReferenceManyField,
    SingleFieldList,
    ChipField,
} from 'react-admin';
import NoSortDatagrid from './components/NoSortDatagrid';

// Custom field to display the primary address
const AddressField = ({ record }: { record?: any }) => {
    if (!record || !record.addresses || record.addresses.length === 0) {
        return <span>Нет адреса</span>;
    }

    // Display the first address
    const address = record.addresses[0];
    return (
        <span>
            {address.city}, {address.street}, {address.houseNumber}
            {address.apartment ? `, кв. ${address.apartment}` : ''}
        </span>
    );
};

export const UserList = () => (
    <List>
        <NoSortDatagrid
            rowClick='edit'
            bulkActionButtons={<BulkDeleteButton />}
        >
            <TextField source='id' label='ID' />
            <TextField source='name' label='Имя' />
            <TextField source='surname' label='Фамилия' />
            <EmailField source='email' label='Email' />
            <TextField source='phoneNumber' label='Телефон' />
            <TextField source='role' label='Роль' />
            <TextField source='rating' label='Рейтинг' />
        </NoSortDatagrid>
    </List>
);

export const UserEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source='name' label='Имя' />
            <TextInput source='surname' label='Фамилия' />
            <TextInput source='email' label='Email' />
            <TextInput source='phoneNumber' label='Телефон' />
            <SelectInput
                source='role'
                label='Роль'
                choices={[
                    { id: 'USER', name: 'Пользователь' },
                    { id: 'ADMIN', name: 'Администратор' },
                    { id: 'COOK', name: 'Повар' },
                    { id: 'COURIER', name: 'Курьер' },
                ]}
            />
            <NumberInput source='rating' label='Рейтинг' />

            <ReferenceManyField
                reference='addresses'
                target='userId'
                label='Адреса'
            >
                <SingleFieldList>
                    <ChipField source='city' />
                </SingleFieldList>
            </ReferenceManyField>
        </SimpleForm>
    </Edit>
);

export const UserCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Пользователь успешно создан');
        redirect('list', 'users');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <TextInput source='name' required label='Имя' />
                <TextInput source='surname' required label='Фамилия' />
                <TextInput source='email' required label='Email' />
                <TextInput source='phoneNumber' label='Телефон' />
                <TextInput source='passwordHash' required label='Хеш пароля' />
                <SelectInput
                    source='role'
                    label='Роль'
                    choices={[
                        { id: 'USER', name: 'Пользователь' },
                        { id: 'ADMIN', name: 'Администратор' },
                        { id: 'COOK', name: 'Повар' },
                        { id: 'COURIER', name: 'Курьер' },
                    ]}
                    defaultValue='USER'
                />
                <NumberInput source='rating' defaultValue={0} label='Рейтинг' />
            </SimpleForm>
        </Create>
    );
};
