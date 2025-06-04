'use client';

import Link from 'next/link';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { LocalShipping as LocalShippingIcon } from '@mui/icons-material';

export default function AdminPage() {
    return (
        <div className='p-6'>
            <h1 className='text-2xl font-bold mb-6'>Панель администратора</h1>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                    <Card>
                        <CardContent>
                            <Box display='flex' alignItems='center' mb={2}>
                                <LocalShippingIcon
                                    fontSize='large'
                                    color='primary'
                                />
                                <Typography
                                    variant='h6'
                                    component='h2'
                                    sx={{ ml: 1 }}
                                >
                                    Управление доставкой
                                </Typography>
                            </Box>
                            <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ mb: 2 }}
                            >
                                Управление доставками заказов, назначение
                                курьеров и отслеживание доставок на карте
                            </Typography>
                            <Link href='/admin/delivery' passHref>
                                <Button
                                    variant='contained'
                                    color='primary'
                                    component='a'
                                >
                                    Перейти к управлению доставкой
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Add more dashboard cards here */}
            </div>
        </div>
    );
}
