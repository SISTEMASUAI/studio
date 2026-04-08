'use client';

import { usePathname } from 'next/navigation';
import AppShell from '@/components/AppShell';

export default function NavigationWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAppPage = pathname !== '/' && pathname !== null;

    if (isAppPage) {
        return <AppShell>{children}</AppShell>;
    }
    return <>{children}</>;
}
