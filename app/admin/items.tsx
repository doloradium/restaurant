'use client';

import {
    List,
    Datagrid,
    TextField,
    NumberField,
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    Create,
    useRecordContext,
    useCreate,
    useRedirect,
    useNotify,
    SaveButton,
    Toolbar,
    ToolbarProps,
    Loading,
    RaRecord,
    Identifier,
    useGetIdentity,
    BulkDeleteButton,
} from 'react-admin';
import { useState, useRef, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import ImageGallery from './components/ImageGallery';
import ImageView from './components/ImageView';
import {
    Box,
    Divider,
    Typography,
    Button,
    CircularProgress,
} from '@mui/material';

export const ItemList = () => (
    <List>
        <Datagrid rowClick='edit' bulkActionButtons={<BulkDeleteButton />}>
            <TextField source='id' />
            <TextField source='name' />
            <TextField source='description' />
            <NumberField source='price' />
            <TextField source='categoryId' />
        </Datagrid>
    </List>
);

const ItemEditContent = () => {
    const record = useRecordContext();
    const itemId = record?.id;
    const [refreshKey, setRefreshKey] = useState(0);

    const handleImageUploadSuccess = () => {
        // Force refresh by changing key
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <>
            <SimpleForm>
                <TextInput source='name' />
                <TextInput source='description' multiline />
                <NumberInput source='price' />
                <ReferenceInput source='categoryId' reference='categories'>
                    <SelectInput optionText='name' />
                </ReferenceInput>
            </SimpleForm>

            {itemId && (
                <Box sx={{ mt: 2, p: 2 }}>
                    <Typography variant='h6' sx={{ mb: 2 }}>
                        Images Management
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <ImageGallery
                        key={`gallery-${refreshKey}`}
                        itemId={itemId}
                    />
                    <ImageUpload
                        itemId={itemId}
                        onUploadSuccess={handleImageUploadSuccess}
                    />
                </Box>
            )}
        </>
    );
};

export const ItemEdit = () => (
    <Edit>
        <ItemEditContent />
    </Edit>
);

const SaveToolbar = (props: ToolbarProps) => (
    <Toolbar {...props}>
        <SaveButton label='Save Item' />
    </Toolbar>
);

export const ItemCreate = () => {
    const [create] = useCreate();
    const notify = useNotify();
    const redirect = useRedirect();
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileSelect = (files: File[]) => {
        setSelectedFiles(files);
    };

    const uploadImages = async (itemId: number) => {
        if (!selectedFiles.length) return;

        const formData = new FormData();

        // Add each file with the field name 'file'
        selectedFiles.forEach((file) => {
            formData.append('file', file);
        });

        formData.append('itemId', itemId.toString());

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload images');
            }

            const result = await response.json();
            notify(`Successfully uploaded ${result.images.length} images`, {
                type: 'success',
            });
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            notify(`Error uploading images: ${message}`, { type: 'error' });
        }
    };

    const handleSubmit = async (data: any) => {
        setLoading(true);

        try {
            // First create the item
            const result = await create(
                'items',
                { data },
                {
                    onSuccess: async (response) => {
                        const itemId = Number(response.id);
                        notify('Item created successfully', {
                            type: 'success',
                        });

                        // Then upload any selected images
                        if (selectedFiles.length) {
                            await uploadImages(itemId);
                        }

                        // Finally redirect to the item list
                        redirect('list', 'items');
                    },
                    onError: (error: unknown) => {
                        const errorMessage =
                            error instanceof Error
                                ? error.message
                                : 'Unknown error';
                        notify(`Error creating item: ${errorMessage}`, {
                            type: 'error',
                        });
                        setLoading(false);
                    },
                }
            );
        } catch (error) {
            console.error('Error creating item:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box
                display='flex'
                justifyContent='center'
                alignItems='center'
                minHeight='200px'
            >
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>
                    Creating item and uploading images...
                </Typography>
            </Box>
        );
    }

    return (
        <Create>
            <div>
                <SimpleForm onSubmit={handleSubmit} toolbar={<SaveToolbar />}>
                    <TextInput source='name' fullWidth required />
                    <TextInput source='description' fullWidth multiline />
                    <NumberInput source='price' fullWidth required />
                    <ReferenceInput source='categoryId' reference='categories'>
                        <SelectInput optionText='name' fullWidth required />
                    </ReferenceInput>

                    <Box sx={{ mt: 3, mb: 2 }}>
                        <Typography variant='h6' sx={{ mb: 2 }}>
                            Select Images to Upload
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <input
                            type='file'
                            multiple
                            accept='image/*'
                            onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                handleFileSelect(files);
                            }}
                        />

                        {selectedFiles.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant='body2'>
                                    {selectedFiles.length}{' '}
                                    {selectedFiles.length === 1
                                        ? 'file'
                                        : 'files'}{' '}
                                    selected
                                </Typography>
                                <Box
                                    sx={{
                                        mt: 1,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                    }}
                                >
                                    {selectedFiles.map((file, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                position: 'relative',
                                                border: '1px solid #ccc',
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <ImageView
                                                source={URL.createObjectURL(
                                                    file
                                                )}
                                                alt={`Preview ${index}`}
                                                className='w-full h-full object-contain'
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </SimpleForm>
            </div>
        </Create>
    );
};
