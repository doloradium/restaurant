'use client';

import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    DateField,
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    SelectInput,
    ReferenceInput,
    Create,
    BulkDeleteButton,
    useRedirect,
    useNotify,
} from 'react-admin';

export const OrderList = () => (
    <List>
        <Datagrid rowClick='edit' bulkActionButtons={<BulkDeleteButton />}>
            <TextField source='id' />
            <TextField source='userId' />
            <TextField source='courierId' />
            <TextField source='paymentType' />
            <BooleanField source='isPaid' />
            <BooleanField source='isCompleted' />
            <DateField source='dateOrdered' />
            <DateField source='dateArrived' />
            <TextField source='status' />
        </Datagrid>
    </List>
);

export const OrderEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceInput source='userId' reference='users'>
                <SelectInput optionText='email' />
            </ReferenceInput>
            <ReferenceInput source='courierId' reference='users'>
                <SelectInput optionText='email' />
            </ReferenceInput>
            <TextInput source='paymentType' />
            <BooleanInput source='isPaid' />
            <BooleanInput source='isCompleted' />
            <SelectInput
                source='status'
                choices={[
                    { id: 'PENDING', name: 'Pending' },
                    { id: 'CONFIRMED', name: 'Confirmed' },
                    { id: 'PREPARING', name: 'Preparing' },
                    { id: 'READY', name: 'Ready' },
                    { id: 'DELIVERED', name: 'Delivered' },
                    { id: 'CANCELLED', name: 'Cancelled' },
                ]}
            />
        </SimpleForm>
    </Edit>
);

export const OrderCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Order created successfully');
        redirect('list', 'orders');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <ReferenceInput source='userId' reference='users'>
                    <SelectInput optionText='email' required />
                </ReferenceInput>
                <ReferenceInput source='courierId' reference='users'>
                    <SelectInput optionText='email' />
                </ReferenceInput>
                <TextInput source='paymentType' required />
                <BooleanInput source='isPaid' defaultValue={false} />
                <BooleanInput source='isCompleted' defaultValue={false} />
                <SelectInput
                    source='status'
                    choices={[
                        { id: 'PENDING', name: 'Pending' },
                        { id: 'CONFIRMED', name: 'Confirmed' },
                        { id: 'PREPARING', name: 'Preparing' },
                        { id: 'READY', name: 'Ready' },
                        { id: 'DELIVERED', name: 'Delivered' },
                        { id: 'CANCELLED', name: 'Cancelled' },
                    ]}
                    defaultValue='PENDING'
                />
            </SimpleForm>
        </Create>
    );
};
