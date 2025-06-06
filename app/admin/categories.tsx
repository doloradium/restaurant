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

export const CategoryList = () => (
    <List sort={{ field: 'id', order: 'ASC' }}>
        <Datagrid
            rowClick='edit'
            bulkActionButtons={<BulkDeleteButton />}
            sort={{ field: 'id', order: 'ASC' }}
        >
            <TextField source='id' label='ID' sortable={false} />
            <TextField source='name' label='Название' sortable={false} />
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
                <TextInput source='name' label='Название' fullWidth />
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
                <TextInput source='name' label='Название' required />
            </SimpleForm>
        </Create>
    );
};
