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
    BulkDeleteButton,
    ExportButton,
    TopToolbar,
    SelectField,
    ReferenceField,
} from 'react-admin';

// Общие литералы для способов оплаты и статусов
const paymentTypeChoices = [
    { id: 'CARD', name: 'Карта' },
    { id: 'CASH', name: 'Наличные' },
];

const statusChoices = [
    { id: 'PENDING', name: 'Ожидание' },
    { id: 'CONFIRMED', name: 'Подтвержден' },
    { id: 'PREPARING', name: 'Готовится' },
    { id: 'READY', name: 'Готов' },
    { id: 'DELIVERED', name: 'Доставлен' },
    { id: 'CANCELLED', name: 'Отменен' },
];

// Панель инструментов без кнопки создания
const ListActions = () => (
    <TopToolbar>
        <ExportButton />
    </TopToolbar>
);

export const OrderList = () => (
    <List actions={<ListActions />} sort={{ field: 'id', order: 'DESC' }}>
        <Datagrid rowClick='edit' bulkActionButtons={<BulkDeleteButton />}>
            <TextField source='id' label='ID' sortable={false} />
            <ReferenceField
                source='userId'
                reference='users'
                label='Пользователь'
                sortable={false}
                link='show'
            >
                <TextField source='email' />
            </ReferenceField>
            <ReferenceField
                source='courierId'
                reference='users'
                label='Курьер'
                sortable={false}
                link='show'
                emptyText='-'
            >
                <TextField source='email' />
            </ReferenceField>
            <SelectField
                source='paymentType'
                label='Способ оплаты'
                sortable={false}
                choices={paymentTypeChoices}
            />
            <BooleanField source='isPaid' label='Оплачен' sortable={false} />
            <BooleanField
                source='isCompleted'
                label='Завершен'
                sortable={false}
            />
            <DateField
                source='dateOrdered'
                label='Дата заказа'
                sortable={false}
            />
            <DateField
                source='dateArrived'
                label='Дата доставки'
                sortable={false}
            />
            <SelectField
                source='status'
                label='Статус'
                sortable={false}
                choices={statusChoices}
            />
        </Datagrid>
    </List>
);

export const OrderEdit = () => (
    <Edit>
        <SimpleForm>
            <ReferenceInput
                source='userId'
                reference='users'
                label='Пользователь'
            >
                <SelectInput label='Пользователь' optionText='email' />
            </ReferenceInput>
            <ReferenceInput
                source='courierId'
                reference='users'
                label='Курьер'
                filter={{ role: 'COURIER' }}
            >
                <SelectInput label='Курьер' optionText='email' />
            </ReferenceInput>
            <SelectInput
                source='paymentType'
                label='Способ оплаты'
                choices={paymentTypeChoices}
            />
            <BooleanInput source='isPaid' label='Оплачен' />
            <BooleanInput source='isCompleted' label='Завершен' />
            <SelectInput
                source='status'
                label='Статус'
                choices={statusChoices}
            />
        </SimpleForm>
    </Edit>
);
