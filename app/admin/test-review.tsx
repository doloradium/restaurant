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

export default function TestReview() {
    const [reviewId, setReviewId] = useState('1');
    const [reviewText, setReviewText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch current review to test
    useEffect(() => {
        const fetchReview = async () => {
            if (!reviewId) return;

            try {
                const response = await fetch(`/api/admin/reviews/${reviewId}`);
                if (response.ok) {
                    const data = await response.json();
                    setReviewText(data.text || '');
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

        fetchReview();
    }, [reviewId]);

    const handleUpdate = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log(`Updating review ${reviewId} with text: ${reviewText}`);

            // Get the original data first
            const getResponse = await fetch(`/api/admin/reviews/${reviewId}`);
            if (!getResponse.ok) {
                throw new Error('Failed to fetch review data');
            }

            const originalData = await getResponse.json();

            // Create update payload with original IDs and new text
            const updateData = {
                userId: originalData.userId,
                itemId: originalData.itemId,
                text: reviewText,
            };

            console.log('Update payload:', updateData);

            const response = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

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
                Test Review Update API
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        label='Review ID'
                        value={reviewId}
                        onChange={(e) => setReviewId(e.target.value)}
                        fullWidth
                        margin='normal'
                    />

                    <TextField
                        label='Review Text'
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        margin='normal'
                    />

                    <Button
                        variant='contained'
                        onClick={handleUpdate}
                        disabled={loading || !reviewText}
                        sx={{ mt: 2 }}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            'Update Review'
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
