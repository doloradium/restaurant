'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import toast from 'react-hot-toast';

const LogoutButton = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                toast.success('Logged out successfully');
                // Redirect to admin login page
                router.push('/admin-login');
            } else {
                toast.error('Failed to log out');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to log out');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            color='inherit'
            onClick={handleLogout}
            disabled={isLoading}
            startIcon={<LogoutIcon />}
            style={{ margin: '0 10px' }}
        >
            {isLoading ? 'Logging out...' : 'Logout'}
        </Button>
    );
};

export default LogoutButton;
