'use client';

import type { Metadata } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import AppShell from '@/components/AppShell';
import { usePathname } from 'next/navigation';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-headline',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

// export const metadata: Metadata = {
//   title: 'Campus Hub',
//   description: 'Unified portal for intranet and virtual classroom.',
// };

function AppShellOrChildren({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAppPage = !['/', '/signup'].includes(pathname);

    if (isAppPage) {
        return <AppShell>{children}</AppShell>;
    }
    return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <title>Campus Hub</title>
        <meta name="description" content="Unified portal for intranet and virtual classroom." />
      </head>
      <body className={`${poppins.variable} ${ptSans.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          <AppShellOrChildren>
            {children}
          </AppShellOrChildren>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
