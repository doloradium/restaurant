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
} from 'react-admin';

export const UserList = () => (
    <List>
        <Datagrid rowClick='edit' bulkActionButtons={<BulkDeleteButton />}>
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

export const UserCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('User created successfully');
        redirect('list', 'users');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <TextInput source='name' required />
                <TextInput source='surname' required />
                <TextInput source='email' required />
                <TextInput source='phoneNumber' />
                <TextInput source='street' />
                <TextInput source='house' />
                <TextInput source='apartment' />
                <TextInput source='passwordHash' required />
                <SelectInput
                    source='role'
                    choices={[
                        { id: 'USER', name: 'User' },
                        { id: 'ADMIN', name: 'Admin' },
                        { id: 'COOK', name: 'Cook' },
                        { id: 'COURIER', name: 'Courier' },
                    ]}
                    defaultValue='USER'
                />
                <NumberInput source='rating' defaultValue={0} />
            </SimpleForm>
        </Create>
    );
};
