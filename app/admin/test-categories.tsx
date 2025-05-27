'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Button,
} from '@mui/material';

export default function TestCategories() {
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching all categories...');
            const response = await fetch('/api/admin/categories');

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ error: 'Unknown error' }));
                throw new Error(
                    errorData.error || `HTTP error! status: ${response.status}`
                );
            }

            const data = await response.json();
            console.log('Categories API response:', data);

            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(
                `Error: ${err instanceof Error ? err.message : String(err)}`
            );
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant='h4' gutterBottom>
                Categories API Test
            </Typography>

            <Button
                variant='contained'
                onClick={fetchCategories}
                sx={{ mb: 2 }}
                disabled={loading}
            >
                Refresh Categories
            </Button>

            <Paper sx={{ p: 3, mb: 3 }}>
                {loading ? (
                    <Box display='flex' justifyContent='center' p={2}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color='error' sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                ) : categories.length === 0 ? (
                    <Typography>No categories found</Typography>
                ) : (
                    <Box>
                        <Typography variant='h6' sx={{ mb: 2 }}>
                            {categories.length} Categories Found:
                        </Typography>

                        {categories.map((category) => (
                            <Paper
                                key={category.id}
                                sx={{ p: 2, mb: 2, bgcolor: '#f5f5f5' }}
                            >
                                <Typography>
                                    <strong>ID:</strong> {category.id}
                                </Typography>
                                <Typography>
                                    <strong>Name:</strong> {category.name}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
