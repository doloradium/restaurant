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
    <List>
        <Datagrid rowClick='edit' bulkActionButtons={<BulkDeleteButton />}>
            <TextField source='id' />
            <TextField source='name' />
        </Datagrid>
    </List>
);

// Simple edit toolbar
const EditToolbar = (props: ToolbarProps) => (
    <Toolbar {...props}>
        <SaveButton />
    </Toolbar>
);

// Simplified category edit component using React-Admin defaults
export const CategoryEdit = () => {
    return (
        <Edit>
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source='name' fullWidth />
            </SimpleForm>
        </Edit>
    );
};

// Simple category create component
export const CategoryCreate = () => {
    const redirect = useRedirect();
    const notify = useNotify();

    const onSuccess = () => {
        notify('Category created successfully');
        redirect('list', 'categories');
    };

    return (
        <Create mutationOptions={{ onSuccess }}>
            <SimpleForm toolbar={<EditToolbar />}>
                <TextInput source='name' required />
            </SimpleForm>
        </Create>
    );
};
