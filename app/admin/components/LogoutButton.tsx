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
                toast.success('Вы успешно вышли из системы');
                // Redirect to admin login page
                router.push('/admin-login');
            } else {
                toast.error('Не удалось выйти');
            }
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Не удалось выйти');
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
            {isLoading ? 'Загрузка...' : 'Выйти'}
        </Button>
    );
};

export default LogoutButton;
