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
    SaveButton,
    Toolbar,
    ToolbarProps,
} from 'react-admin';
import { Typography } from '@mui/material';

export const CategoryList = () => (
    <List>
        <Datagrid rowClick='edit' bulkActionButtons={<BulkDeleteButton />}>
            <TextField source='id' label='ID' />
            <TextField source='name' label='Название' />
            <TextField
                source='originalName'
                label='Системное название (англ.)'
            />
        </Datagrid>
    </List>
);

// Simple edit toolbar
const EditToolbar = (props: ToolbarProps) => (
    <Toolbar {...props}>
        <SaveButton label='Сохранить' />
    </Toolbar>
);

// Simplified category edit component using React-Admin defaults
export const CategoryEdit = () => {
    return (
        <Edit>
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source='name' label='Название (рус.)' fullWidth />
                <TextInput
                    source='originalName'
                    label='Системное название (англ.)'
                    fullWidth
                />
                <Typography
                    variant='body2'
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    * Системное название должно быть на английском языке и
                    используется для API запросов и URL ссылок.
                </Typography>
            </SimpleForm>
        </Edit>
    );
};

// Simple category create component
export const CategoryCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Категория успешно создана');
        redirect('list', 'categories');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source='name' label='Название (рус.)' required />
                <TextInput
                    source='originalName'
                    label='Системное название (англ.)'
                    required
                />
                <Typography
                    variant='body2'
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    * Системное название должно быть на английском языке и
                    используется для API запросов и URL ссылок.
                </Typography>
            </SimpleForm>
        </Create>
    );
};
