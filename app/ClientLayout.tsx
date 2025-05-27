'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminRoute = pathname.startsWith('/admin');
    const isCookRoute = pathname.startsWith('/cook');
    const isCourierRoute = pathname.startsWith('/courier');
    const shouldShowHeaderFooter =
        !isAdminRoute && !isCookRoute && !isCourierRoute;

    return (
        <>
            {shouldShowHeaderFooter && <Header />}
            {children}
            {shouldShowHeaderFooter && <Footer />}
        </>
    );
}
