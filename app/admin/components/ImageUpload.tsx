'use client';

import React, { useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    Box,
} from '@mui/material';
import { useNotify } from 'react-admin';

interface ImageUploadProps {
    itemId: string | number;
    onUploadSuccess?: (imageData: any) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    itemId,
    onUploadSuccess,
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const notify = useNotify();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            notify('Please select a file to upload', { type: 'warning' });
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('itemId', itemId.toString());

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload image');
            }

            notify('Image uploaded successfully', { type: 'success' });
            setFile(null);
            setPreview(null);

            if (onUploadSuccess) {
                onUploadSuccess(data.image);
            }
        } catch (error) {
            console.error('Upload error:', error);
            notify(
                `Upload failed: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                { type: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant='h6' gutterBottom>
                    Upload Image
                </Typography>

                <input
                    accept='image/*'
                    style={{ display: 'none' }}
                    id='image-upload-button'
                    type='file'
                    onChange={handleFileChange}
                />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <label htmlFor='image-upload-button'>
                        <Button
                            variant='contained'
                            component='span'
                            color='primary'
                        >
                            Select Image
                        </Button>
                    </label>

                    {file && (
                        <Typography variant='body2'>
                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </Typography>
                    )}

                    {preview && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <img
                                src={preview}
                                alt='Preview'
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>
                    )}

                    <Button
                        variant='contained'
                        color='secondary'
                        onClick={handleUpload}
                        disabled={!file || loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} color='inherit' />
                        ) : (
                            'Upload'
                        )}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ImageUpload;
