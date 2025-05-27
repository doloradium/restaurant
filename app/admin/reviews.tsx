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
    Create,
    BulkDeleteButton,
    useRedirect,
    useNotify,
} from 'react-admin';

export const ReviewList = () => (
    <List>
        <Datagrid rowClick='edit' bulkActionButtons={<BulkDeleteButton />}>
            <TextField source='id' />
            <TextField source='item.name' label='Item' />
            <TextField source='user.name' label='User Name' />
            <TextField source='user.surname' label='User Surname' />
            <DateField source='createdAt' />
            <TextField source='text' />
        </Datagrid>
    </List>
);

export const ReviewEdit = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Review updated successfully');
        redirect('list', 'reviews');
    };

    const onError = (error: any) => {
        notify(`Error: ${error.message || 'Failed to update review'}`, {
            type: 'error',
        });
    };

    return (
        <Edit
            mutationMode='pessimistic'
            mutationOptions={{
                onSuccess,
                onError,
            }}
        >
            <SimpleForm>
                <ReferenceInput source='itemId' reference='items'>
                    <SelectInput optionText='name' />
                </ReferenceInput>
                <ReferenceInput source='userId' reference='users'>
                    <SelectInput optionText='email' />
                </ReferenceInput>
                <TextInput source='text' multiline required />
            </SimpleForm>
        </Edit>
    );
};

export const ReviewCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Review created successfully');
        redirect('list', 'reviews');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <ReferenceInput source='itemId' reference='items'>
                    <SelectInput optionText='name' required />
                </ReferenceInput>
                <ReferenceInput source='userId' reference='users'>
                    <SelectInput optionText='email' required />
                </ReferenceInput>
                <TextInput source='text' multiline required />
            </SimpleForm>
        </Create>
    );
};
