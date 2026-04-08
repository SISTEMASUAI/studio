import type { Metadata } from 'next';
import { Poppins, PT_Sans } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import NavigationWrapper from '@/components/NavigationWrapper';

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

export const metadata: Metadata = {
  title: 'Nuxtu',
  description: 'Portal unificado para intranet y aula virtual.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${poppins.variable} ${ptSans.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          <NavigationWrapper>
            {children}
          </NavigationWrapper>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
