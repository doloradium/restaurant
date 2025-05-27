'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    CircularProgress,
} from '@mui/material';

export default function TestRoute() {
    const [categoryId, setCategoryId] = useState('1');
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch current category to test
    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) return;

            try {
                const response = await fetch(
                    `/api/admin/categories/${categoryId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCategoryName(data.name || '');
                    setResult(data);
                    setError(null);
                } else {
                    const errorData = await response.json();
                    setError(
                        `Error fetching: ${
                            errorData.error || response.statusText
                        }`
                    );
                }
            } catch (err) {
                setError(
                    `Exception: ${
                        err instanceof Error ? err.message : String(err)
                    }`
                );
            }
        };

        fetchCategory();
    }, [categoryId]);

    const handleUpdate = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log(
                `Updating category ${categoryId} with name: ${categoryName}`
            );

            const response = await fetch(
                `/api/admin/categories/${categoryId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: categoryName }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                console.log('Update successful:', data);
                setResult(data);
                setError(null);
            } else {
                console.error('Update failed:', data);
                setError(
                    `Error updating: ${data.error || response.statusText}`
                );
            }
        } catch (err) {
            console.error('Exception during update:', err);
            setError(
                `Exception: ${err instanceof Error ? err.message : String(err)}`
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
            <Typography variant='h4' gutterBottom>
                Test Category Update API
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        label='Category ID'
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        fullWidth
                        margin='normal'
                    />

                    <TextField
                        label='Category Name'
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        fullWidth
                        margin='normal'
                    />

                    <Button
                        variant='contained'
                        onClick={handleUpdate}
                        disabled={loading || !categoryName}
                        sx={{ mt: 2 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Update Category'
                        )}
                    </Button>
                </Box>

                {error && (
                    <Typography color='error' sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {result && (
                    <Box>
                        <Typography variant='h6'>Result:</Typography>
                        <pre
                            style={{
                                background: '#f5f5f5',
                                padding: 15,
                                overflow: 'auto',
                            }}
                        >
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}
