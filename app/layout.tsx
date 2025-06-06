import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClientLayout from './ClientLayout';
import AuthProvider from './AuthProvider';
import { CookAuthProvider } from './CookAuthProvider';
import { CourierAuthProvider } from './CourierAuthProvider';
import CartProvider from './CartProvider';
import DeliveryProvider from './DeliveryProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Ресторан',
    description: 'Сайт ресторана',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang='ru'>
            <body className={inter.className}>
                <AuthProvider>
                    <CookAuthProvider>
                        <CourierAuthProvider>
                            <CartProvider>
                                <DeliveryProvider>
                                    <Toaster position='top-right' />
                                    <ClientLayout>{children}</ClientLayout>
                                </DeliveryProvider>
                            </CartProvider>
                        </CourierAuthProvider>
                    </CookAuthProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
