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
    NumberInput,
    FunctionField,
} from 'react-admin';
import NoSortDatagrid from './components/NoSortDatagrid';

export const ReviewList = () => (
    <List>
        <NoSortDatagrid
            rowClick='edit'
            bulkActionButtons={<BulkDeleteButton />}
        >
            <TextField source='id' />
            <TextField source='item.name' label='Блюдо' />
            <TextField source='user.name' label='Имя пользователя' />
            <TextField source='user.surname' label='Фамилия пользователя' />
            <FunctionField
                source='rating'
                label='Рейтинг'
                render={(record) => {
                    if (!record || record.rating === undefined) {
                        return 'Нет данных';
                    }
                    return `${record.rating} / 5`;
                }}
            />
            <DateField source='createdAt' label='Дата создания' />
            <TextField source='text' label='Текст отзыва' />
        </NoSortDatagrid>
    </List>
);

export const ReviewEdit = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Отзыв успешно обновлен');
        redirect('list', 'reviews');
    };

    const onError = (error: any) => {
        notify(`Ошибка: ${error.message || 'Не удалось обновить отзыв'}`, {
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
                <ReferenceInput source='itemId' reference='items' label='Блюдо'>
                    <SelectInput label='Блюдо' optionText='name' />
                </ReferenceInput>
                <ReferenceInput
                    source='userId'
                    reference='users'
                    label='Пользователь'
                >
                    <SelectInput label='Пользователь' optionText='email' />
                </ReferenceInput>
                <NumberInput
                    source='rating'
                    label='Рейтинг'
                    min={1}
                    max={5}
                    defaultValue={5}
                />
                <TextInput
                    source='text'
                    multiline
                    required
                    label='Текст отзыва'
                />
            </SimpleForm>
        </Edit>
    );
};

export const ReviewCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Отзыв успешно создан');
        redirect('list', 'reviews');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm>
                <ReferenceInput source='itemId' reference='items' label='Блюдо'>
                    <SelectInput label='Блюдо' optionText='name' required />
                </ReferenceInput>
                <ReferenceInput
                    source='userId'
                    reference='users'
                    label='Пользователь'
                >
                    <SelectInput
                        label='Пользователь'
                        optionText='email'
                        required
                    />
                </ReferenceInput>
                <NumberInput
                    source='rating'
                    label='Рейтинг'
                    min={1}
                    max={5}
                    defaultValue={5}
                />
                <TextInput
                    source='text'
                    multiline
                    required
                    label='Текст отзыва'
                />
            </SimpleForm>
        </Create>
    );
};
