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
            notify('Пожалуйста, выберите файл для загрузки', {
                type: 'warning',
            });
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
                throw new Error(
                    data.error || 'Не удалось загрузить изображение'
                );
            }

            notify('Изображение успешно загружено', { type: 'success' });
            setFile(null);
            setPreview(null);

            if (onUploadSuccess) {
                onUploadSuccess(data.image);
            }
        } catch (error) {
            console.error('Upload error:', error);
            notify(
                `Ошибка загрузки: ${
                    error instanceof Error
                        ? error.message
                        : 'Неизвестная ошибка'
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
                    Загрузка изображения
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
                            Выбрать изображение
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
                                alt='Предпросмотр'
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
                            'Загрузить'
                        )}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ImageUpload;
