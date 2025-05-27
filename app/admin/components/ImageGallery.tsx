'use client';

import React, { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    IconButton,
    CardActions,
    Box,
    CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotify, useRecordContext } from 'react-admin';
import ImageView from './ImageView';

interface Image {
    id: number;
    itemId: number;
    imageUrl: string;
}

interface ImageGalleryProps {
    itemId?: string | number;
    onImageDeleted?: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
    itemId: propItemId,
    onImageDeleted,
}) => {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(true);
    const record = useRecordContext();
    const notify = useNotify();
    const galleryRef = React.useRef<HTMLDivElement>(null);

    // Use itemId from props if provided, otherwise from the record context
    const itemId = propItemId || record?.id;

    // Expose refresh method through DOM element
    React.useEffect(() => {
        if (galleryRef.current) {
            // @ts-ignore
            galleryRef.current.__gallery_refresh = fetchImages;
        }
        return () => {
            if (galleryRef.current) {
                // @ts-ignore
                delete galleryRef.current.__gallery_refresh;
            }
        };
    }, [itemId]);

    useEffect(() => {
        if (itemId) {
            fetchImages();
        }
    }, [itemId]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/items/${itemId}/images`);
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }
            const data = await response.json();
            setImages(data);
        } catch (error) {
            console.error('Error fetching images:', error);
            notify(
                `Error loading images: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                { type: 'error' }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteImage = async (imageId: number) => {
        if (!confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/images/${imageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete image');
            }

            notify('Image deleted successfully', { type: 'success' });

            // Remove from local state
            setImages(images.filter((img) => img.id !== imageId));

            // Callback
            if (onImageDeleted) {
                onImageDeleted();
            }
        } catch (error) {
            console.error('Delete error:', error);
            notify(
                `Delete failed: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
                { type: 'error' }
            );
        }
    };

    if (!itemId) {
        return <Typography>No item selected</Typography>;
    }

    return (
        <Card sx={{ mb: 3 }} data-testid='image-gallery' ref={galleryRef}>
            <CardContent>
                <Typography variant='h6' gutterBottom>
                    Item Images
                </Typography>

                {loading ? (
                    <Box display='flex' justifyContent='center' p={2}>
                        <CircularProgress />
                    </Box>
                ) : images.length === 0 ? (
                    <Typography variant='body2' color='textSecondary'>
                        No images available
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {images.map((image) => (
                            <Box
                                key={image.id}
                                sx={{
                                    width: { xs: '100%', sm: '45%', md: '30%' },
                                    flexGrow: 0,
                                    flexShrink: 0,
                                }}
                            >
                                <Card>
                                    <Box
                                        sx={{
                                            height: 200,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            overflow: 'hidden',
                                            backgroundColor: '#f5f5f5',
                                        }}
                                    >
                                        <ImageView
                                            source={image.imageUrl}
                                            alt={`Item Image ${image.id}`}
                                            className='w-full h-full object-contain'
                                        />
                                    </Box>
                                    <CardActions
                                        sx={{ justifyContent: 'flex-end' }}
                                    >
                                        <IconButton
                                            color='error'
                                            size='small'
                                            onClick={() =>
                                                handleDeleteImage(image.id)
                                            }
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ImageGallery;
