'use client';

import { Admin, Resource, Layout, AppBar, LayoutProps } from 'react-admin';
import { Box, Typography } from '@mui/material';
import LogoutButton from './components/LogoutButton';
import i18nProvider from './i18n/i18nProvider';

// Custom AppBar with logout button
const CustomAppBar = (props: any) => (
    <AppBar {...props}>
        <Box display='flex' alignItems='center' width='100%'>
            <Box flex={1}>
                <Typography variant='h6' id='react-admin-title'></Typography>
            </Box>
            <LogoutButton />
        </Box>
    </AppBar>
);

// Custom Layout with our custom AppBar
const CustomLayout = (props: LayoutProps) => (
    <Layout {...props} appBar={CustomAppBar} />
);

// Custom Admin component
const CustomAdmin = ({ children, dataProvider }: any) => {
    return (
        <Admin
            layout={CustomLayout}
            dataProvider={dataProvider}
            i18nProvider={i18nProvider}
            defaultTheme='light'
        >
            {children}
        </Admin>
    );
};

export default CustomAdmin;
